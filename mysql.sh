docker exec -it mysql_5.7 mysqldump -uroot -proot --all-databases > ./mysql/init/init.sql