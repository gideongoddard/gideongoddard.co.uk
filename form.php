<?php
// define variables and set to empty values
$name = $email = $message = "";

if ($_SERVER["REQUEST METHOD"] == "POST") {
    $name = test_input($_POST["name"]);
    $email = test_input($_POST["email"]);
    $message = test_input($_POST["message"]);

    function test_input($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }

    if (empty($name) OR empty($message)) {
        // Set a 400 response code.
        http_response_code(400);
        echo "There was a problem with your submission. Please try again.";
        exit;
    }

    // Recipient email address
    $recipient = "goddard.gcw@gmail.com";

    // Subject line
    $subject = "Website form submission from $name";

    // Email content
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Message:\n$message\n";

    // Email headers
    $email_headers = "From: $name <$email>";

    // Send email
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        // Set a 200 response code.
        http_response_code(200);
        echo "Thank you! Your message has been sent.";
    } else {
        // Set a 500 resonse code.
        http_response_code(500);
        echo "Sorry, your message could not be sent."
    }
} else {
    // Not a POST request, set a 403 resopnse code.
    http_response_code(403);
    echo "There was a problem with your submission. Please try again.";
}
?>