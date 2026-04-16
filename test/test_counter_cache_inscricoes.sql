-- Test script to verify counter cache triggers work correctly

-- Step 1: Check current count for a specific aluno
SELECT 'BEFORE INSERT' AS test_phase;
SELECT id, nome, inscricao_count 
FROM alunos 
WHERE id = 9 
LIMIT 1;

-- Step 2: Insert a test inscricao
INSERT INTO inscricoes (registro, aluno_id, muralestagio_id, data, periodo, timestamp)
VALUES (99999, 9, 1, NOW(), '2026/1', NOW());

-- Step 3: Verify count increased
SELECT 'AFTER INSERT' AS test_phase;
SELECT id, nome, inscricao_count 
FROM alunos 
WHERE id = 9 
LIMIT 1;

-- Step 4: Get the inserted inscricao ID
SET @test_inscricao_id = LAST_INSERT_ID();

-- Step 5: Delete the test inscricao
DELETE FROM inscricoes WHERE id = @test_inscricao_id;

-- Step 6: Verify count decreased back
SELECT 'AFTER DELETE' AS test_phase;
SELECT id, nome, inscricao_count 
FROM alunos 
WHERE id = 9 
LIMIT 1;

SELECT 'Counter cache test completed!' AS result;
