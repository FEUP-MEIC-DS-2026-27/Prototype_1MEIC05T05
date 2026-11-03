CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive')),
    leader_id INTEGER
);

CREATE TABLE researchers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(100),
    member_status VARCHAR(20) NOT NULL CHECK (member_status IN ('active', 'former')), --KPIs
    employment_type VARCHAR(30) CHECK (employment_type IN ( 'employee', 'scholarship', 'contractor')), --KPIs
    team_id INTEGER REFERENCES teams(id),
    skills TEXT[],
    research_history TEXT[]
);

ALTER TABLE teams
ADD CONSTRAINT fk_team_leader
FOREIGN KEY (leader_id)
REFERENCES researchers(id);


CREATE TABLE researcher_contracts (
    id SERIAL PRIMARY KEY,
    researcher_id INTEGER NOT NULL REFERENCES researchers(id),
    type VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE
);

CREATE TABLE research_topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE researcher_topics (
    researcher_id INTEGER REFERENCES researchers(id),
    topic_id INTEGER REFERENCES research_topics(id),
    PRIMARY KEY (researcher_id, topic_id)
);

CREATE TABLE team_topics (
    team_id INTEGER REFERENCES teams(id),
    topic_id INTEGER REFERENCES research_topics(id),
    PRIMARY KEY (team_id, topic_id)
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'planned'))
);

CREATE TABLE researcher_project_assignments (
    researcher_id INTEGER REFERENCES researchers(id),
    project_id INTEGER REFERENCES projects(id),
    allocation_percentage INTEGER CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    PRIMARY KEY (researcher_id, project_id)
);


-- =========================
-- POPULATION
-- =========================

INSERT INTO teams (name, description, status) VALUES
('Artificial Intelligence Team', 'Research team focused on AI and intelligent systems.', 'active'),
('Computer Vision Team', 'Research team focused on image and video analysis.', 'active'),
('Data Platform Team', 'Research team focused on data platforms.', 'active');

INSERT INTO researchers (name, role, member_status, employment_type, team_id, skills, research_history) VALUES
('Ana Silva', 'Researcher', 'active', 'employee', 1, ARRAY['Machine Learning', 'Python'], ARRAY['Machine Learning for Healthcare', 'Data Analytics']),
('João Costa', 'PhD Researcher', 'active', 'scholarship', 1, ARRAY['NLP', 'Python'], ARRAY['Natural Language Processing']),
('Maria Ferreira', 'Researcher', 'former', 'contractor', 2, ARRAY['Computer Vision'], ARRAY['Image Processing', 'Computer Vision']),
('Rita Oliveira', 'Researcher', 'active', 'employee', 3, ARRAY['Statistics'], ARRAY['Statistical Modelling']);

-- Team leaders

UPDATE teams
SET leader_id = 1
WHERE id = 1;

UPDATE teams
SET leader_id = 3
WHERE id = 2;

UPDATE teams
SET leader_id = 4
WHERE id = 3;

INSERT INTO researcher_contracts (researcher_id, type, start_date, end_date) VALUES
(1, 'Employment Contract', '2024-01-01', '2027-12-31'),
(2, 'Research Scholarship', '2025-09-01', '2027-08-31'),
(3, 'Fixed-term Contract', '2023-01-01', '2025-12-31'),
(4, 'Employment Contract', '2024-03-01', '2026-12-31');


INSERT INTO research_topics (name) VALUES
('Artificial Intelligence'),
('Data Science'),
('Computer Vision');


INSERT INTO researcher_topics (researcher_id, topic_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(3, 3),
(4, 2);


INSERT INTO team_topics (team_id, topic_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 2);


INSERT INTO projects (name, status) VALUES
('HumanISE', 'active'),
('AI4Health', 'active'),
('MedVis', 'completed'),
('Coastal Survey', 'completed');


INSERT INTO researcher_project_assignments (researcher_id, project_id, allocation_percentage) VALUES
(1, 1, 60),
(1, 2, 30),
(2, 1, 100),
(4, 3, 40);


-- Detailed Researcher Profile - researchers
-- Contract / Scholarship Information - researcher_contracts
-- Project Assignments + Allocation % - researcher_project_assignments
-- Create/Edit Teams - teams
-- High-Level People Metrics - calcular a partir de researchers
-- Team Information / Overview - teams + researchers
-- People Distribution across Projects → assignments
-- People by Research Topic - researcher_topics
-- Current / Former Member - member_status