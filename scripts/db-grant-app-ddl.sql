-- Run once as PostgreSQL superuser (e.g. sudo -u postgres psql -d videoplatform -f scripts/db-grant-app-ddl.sql)
GRANT CREATE ON SCHEMA public TO ciright;
GRANT CREATE ON SCHEMA public TO ciright_video_user;
