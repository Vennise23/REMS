<!--
This view is to check if the database is successfully connected to mysql or not.

-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>Laravel & MYSQL DB Connection</title>
    </head>
    <body>
        <div>
        <?php
            if(DB::connection()->getPdo()){
                echo "Sucessfully Connected to DB and DB Name is " .DB::connection()->getDatabaseName();
            }
        ?>
    </div>
</body>
</html>