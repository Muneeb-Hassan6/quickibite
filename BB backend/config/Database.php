<?php
class Database {
    // private $host = "127.0.0.1";
    // private $port = "3306"; 
    // private $db_name = "restaurant_db";
    // private $username = "root";
    // private $password = "";
    private $host = "mysql-quickibite.alwaysdata.net";
    private $port = "3306"; 
    private $db_name = "quickibite_db";
    private $username = "quickibite";
    private $password = "Quickbite@123";

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