## Backup
pg_dump -d stockprod -h localhost -p 5432 -U user -f file.sql --data-only