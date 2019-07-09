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
    // **** INCOMPLETE >> NEEDS FINISHING ****
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo "Thank you, your message has been sent.";
    } else {
        http_response_code(500);
        echo "Sorry, your message couldn't be sent.";
    }
}
    
?>