<?php
declare(strict_types=1);

$log_path = null;
$log_candidates = [
  dirname(__DIR__) . "/contact-error.log",
  __DIR__ . "/contact-error.log",
  sys_get_temp_dir() . "/contact-error.log",
];
foreach ($log_candidates as $candidate) {
  if (is_writable(dirname($candidate))) {
    $log_path = $candidate;
    break;
  }
}
if ($log_path !== null) {
  ini_set("log_errors", "1");
  ini_set("error_log", $log_path);
  error_log("contact.php logging to {$log_path}");
}

$env = [];
$env_paths = [
  dirname(__DIR__) . "/.env",
  __DIR__ . "/.env",
];
$env_loaded_from = "none";
foreach ($env_paths as $env_path) {
  if (!is_readable($env_path)) {
    continue;
  }
  $parsed = parse_ini_file($env_path, false, INI_SCANNER_RAW);
  if (is_array($parsed)) {
    $env = $parsed;
    $env_loaded_from = $env_path;
    break;
  }
}
if ($env_loaded_from !== "none") {
  error_log("contact.php loaded env from {$env_loaded_from}");
} else {
  error_log("contact.php env not found/readable");
}

function env_value(string $key, string $default = ""): string
{
  global $env;
  $value = getenv($key);
  if ($value === false && array_key_exists($key, $env)) {
    $value = $env[$key];
  }
  if ($value === false || $value === null || $value === "") {
    return $default;
  }
  return (string) $value;
}

$config = [
  "smtp_host" => env_value("SMTP_HOST", "smtp.dpoczta.pl"),
  "smtp_port" => (int) env_value("SMTP_PORT", "587"),
  "smtp_user" => env_value("SMTP_USER", "noreplay@zawdam.dev"),
  "smtp_pass" => env_value("SMTP_PASS"),
  "from" => env_value("SMTP_FROM", "noreplay@zawdam.dev"),
  "to" => env_value("SMTP_TO", "hello@zawdam.dev"),
  "site_name" => env_value("SITE_NAME", "zawdam.dev"),
];

function redirect_result(bool $ok): void
{
  $param = $ok ? "sent=1" : "error=1";
  header("Location: /?{$param}#contact");
  exit;
}

function smtp_read($fp): string
{
  $data = "";
  while ($line = fgets($fp, 515)) {
    $data .= $line;
    if (preg_match('/^\d{3} /', $line)) {
      break;
    }
  }
  return $data;
}

function smtp_write($fp, string $command): string
{
  fwrite($fp, $command . "\r\n");
  return smtp_read($fp);
}

function smtp_is_ok(string $response, int $code): bool
{
  return substr($response, 0, 3) === (string) $code;
}

function smtp_send(array $config, string $replyName, string $replyEmail, string $body): bool
{
  $host = $config["smtp_host"];
  $port = (int) $config["smtp_port"];
  $user = $config["smtp_user"];
  $pass = $config["smtp_pass"];
  $from = $config["from"];
  $to = $config["to"];
  $siteName = $config["site_name"];

  $socket = @stream_socket_client(
    "tcp://{$host}:{$port}",
    $errno,
    $errstr,
    10
  );

  if (!$socket) {
    return false;
  }

  stream_set_timeout($socket, 10);
  $response = smtp_read($socket);
  if (!smtp_is_ok($response, 220)) {
    fclose($socket);
    return false;
  }

  $domain = $_SERVER["SERVER_NAME"] ?? "localhost";
  $response = smtp_write($socket, "EHLO {$domain}");
  if (!smtp_is_ok($response, 250)) {
    fclose($socket);
    return false;
  }

  $response = smtp_write($socket, "STARTTLS");
  if (!smtp_is_ok($response, 220)) {
    fclose($socket);
    return false;
  }

  if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
    fclose($socket);
    return false;
  }

  $response = smtp_write($socket, "EHLO {$domain}");
  if (!smtp_is_ok($response, 250)) {
    fclose($socket);
    return false;
  }

  $response = smtp_write($socket, "AUTH LOGIN");
  if (!smtp_is_ok($response, 334)) {
    fclose($socket);
    return false;
  }

  $response = smtp_write($socket, base64_encode($user));
  if (!smtp_is_ok($response, 334)) {
    fclose($socket);
    return false;
  }

  $response = smtp_write($socket, base64_encode($pass));
  if (!smtp_is_ok($response, 235)) {
    fclose($socket);
    return false;
  }

  $response = smtp_write($socket, "MAIL FROM:<{$from}>");
  if (!smtp_is_ok($response, 250)) {
    fclose($socket);
    return false;
  }

  $response = smtp_write($socket, "RCPT TO:<{$to}>");
  if (!smtp_is_ok($response, 250)) {
    fclose($socket);
    return false;
  }

  $response = smtp_write($socket, "DATA");
  if (!smtp_is_ok($response, 354)) {
    fclose($socket);
    return false;
  }

  $subject = "New contact form message - {$siteName}";
  $headers = [
    "From: {$siteName} <{$from}>",
    "Reply-To: {$replyName} <{$replyEmail}>",
    "To: {$to}",
    "Subject: {$subject}",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
  ];

  $message = implode("\r\n", $headers) . "\r\n\r\n" . $body;
  $message = preg_replace('/^\./m', '..', $message);

  fwrite($socket, $message . "\r\n.\r\n");
  $response = smtp_read($socket);
  $ok = smtp_is_ok($response, 250);
  smtp_write($socket, "QUIT");
  fclose($socket);
  return $ok;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo "Method Not Allowed";
  exit;
}

if ($config["smtp_pass"] === "") {
  http_response_code(500);
  echo "Server not configured";
  exit;
}

$honeypot = trim($_POST["company"] ?? "");
if ($honeypot !== "") {
  error_log("contact.php honeypot triggered");
  redirect_result(true);
}

$name = trim($_POST["name"] ?? "");
$email = trim($_POST["email"] ?? "");
$message = trim($_POST["message"] ?? "");
$page = trim($_POST["page"] ?? "");

if ($name === "" || $email === "" || $message === "") {
  error_log("contact.php missing fields");
  redirect_result(false);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  error_log("contact.php invalid email");
  redirect_result(false);
}

if (strlen($message) < 10) {
  error_log("contact.php message too short");
  redirect_result(false);
}

$clean_name = preg_replace('/[\r\n]+/', ' ', $name);
$clean_email = filter_var($email, FILTER_SANITIZE_EMAIL);
$page_info = $page !== "" ? "Page: {$page}\n" : "";
$body = "Name: {$clean_name}\nEmail: {$clean_email}\n{$page_info}\nMessage:\n{$message}\n";

$sent = smtp_send($config, $clean_name, $clean_email, $body);
if (!$sent) {
  error_log("contact.php SMTP send failed");
}
redirect_result($sent);
