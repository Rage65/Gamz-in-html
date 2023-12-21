<?php
if (isset($_COOKIE['chipCount']) && isset($_COOKIE['cps'])) {
    $chipCount = $_COOKIE['chipCount'] + $_COOKIE['cps'];
    setcookie('chipCount', $chipCount, time() + 365 * 24 * 60 * 60, '/');
    echo json_encode(['status' => 'success', 'message' => 'Chips updated successfully.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Chips or CPS cookie not set.']);
}
?>
