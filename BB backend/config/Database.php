<?php
class Database {
# hosting credentials
    private $host = "mysql-quickbite.alwaysdata.net";
    private $port = "3306"; 
    private $db_name = "quickbite_db";
    private $username = "quickbite";
    private $password = "QuickBite123;";

    #private $host = "127.0.0.1";
    #private $port = "3306"; 
    #private $db_name = "restaurant_db";
    #private $username = "root";
    #private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            
            $this->conn = new PDO("mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            
        } catch(PDOException $exception) {
            echo json_encode(["success" => false, "message" => "Database connection error: " . $exception->getMessage()]);
            exit();
        }
        return $this->conn;
    }
}
?>