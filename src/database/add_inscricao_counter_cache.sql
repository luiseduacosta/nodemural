-- Add inscricao_count column to alunos table
-- This tracks how many inscricoes each aluno has made

-- Step 1: Add the column
ALTER TABLE alunos ADD COLUMN inscricao_count INT DEFAULT 0;

-- Step 2: Sync existing data (populate with current counts)
UPDATE alunos a 
SET inscricao_count = (
    SELECT COUNT(*) 
    FROM inscricoes i 
    WHERE i.aluno_id = a.id
);

-- Step 3: Create trigger for INSERT on inscricoes
DELIMITER $$
CREATE TRIGGER trg_inscricao_after_insert 
AFTER INSERT ON inscricoes 
FOR EACH ROW
BEGIN
    UPDATE alunos 
    SET inscricao_count = inscricao_count + 1 
    WHERE id = NEW.aluno_id;
END$$
DELIMITER ;

-- Step 4: Create trigger for DELETE on inscricoes
DELIMITER $$
CREATE TRIGGER trg_inscricao_after_delete 
AFTER DELETE ON inscricoes 
FOR EACH ROW
BEGIN
    UPDATE alunos 
    SET inscricao_count = GREATEST(inscricao_count - 1, 0) 
    WHERE id = OLD.aluno_id;
END$$
DELIMITER ;

-- Step 5: Create trigger for UPDATE on inscricoes (if aluno_id changes)
DELIMITER $$
CREATE TRIGGER trg_inscricao_after_update 
AFTER UPDATE ON inscricoes 
FOR EACH ROW
BEGIN
    IF OLD.aluno_id != NEW.aluno_id THEN
        -- Decrement old aluno's count
        UPDATE alunos 
        SET inscricao_count = GREATEST(inscricao_count - 1, 0) 
        WHERE id = OLD.aluno_id;
        
        -- Increment new aluno's count
        UPDATE alunos 
        SET inscricao_count = inscricao_count + 1 
        WHERE id = NEW.aluno_id;
    END IF;
END$$
DELIMITER ;

-- Step 6: Verify the setup
SELECT 'Column added' AS status;
SHOW COLUMNS FROM alunos LIKE 'inscricao_count';

SELECT 'Triggers created' AS status;
SHOW TRIGGERS FROM ess_apps WHERE `Table` = 'inscricoes';

SELECT 'Sample data' AS status;
SELECT a.id, a.nome, a.inscricao_count, 
       (SELECT COUNT(*) FROM inscricoes i WHERE i.aluno_id = a.id) AS actual_count
FROM alunos a 
WHERE a.inscricao_count > 0 
ORDER BY a.inscricao_count DESC 
LIMIT 10;
