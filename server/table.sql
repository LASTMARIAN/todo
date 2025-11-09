CREATE TABLE IF NOT EXISTS account (
  id SERIAL PRIMARY KEY,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS task (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM task) THEN
    INSERT INTO task (description) VALUES
      ('Complete the project documentation'),
      ('Review the code changes'),
      ('Prepare for the team meeting'),
      ('Update the project timeline'),
      ('Test the new features'),
      ('Fix the reported bugs'),
      ('Deploy the application to production'),
      ('Conduct a code review with peers');
  END IF;
END$$;
