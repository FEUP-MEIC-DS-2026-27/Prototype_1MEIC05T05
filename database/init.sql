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
    member_status VARCHAR(20) NOT NULL CHECK (member_status IN ('active', 'former')),
    employment_type VARCHAR(30) CHECK (employment_type IN ( 'employee', 'scholarship', 'contractor')),
    gender VARCHAR(30),
    nationality VARCHAR(100),
    academic_qualification VARCHAR(150),
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

INSERT INTO teams (name, description, status) VALUES
('Artificial Intelligence Team', 'Research team focused on AI and intelligent systems.', 'active'),
('Computer Vision Team', 'Research team focused on image and video analysis.', 'active'),
('Human-Computer Interaction Team', 'Research on usable and accessible interactive systems.', 'active'),
('Software Engineering Team', 'Research on software development methods and tools.', 'active'),
('Information Systems Team', 'Research on information management and open data.', 'active'),
('Computer Graphics Team', 'Research on 3D graphics, virtual and augmented reality.', 'active'),
('Embedded Systems Team', 'Research on embedded and cyber-physical systems.', 'active'),
('Data Science Team', 'Former team on large-scale data analysis (merged into other teams).', 'inactive');

INSERT INTO researchers (name, role, member_status, employment_type, gender, nationality, academic_qualification, team_id, skills, research_history) VALUES
('Ana Silva', 'Researcher', 'active', 'employee', 'female', 'Portuguese', 'PhD', 1, ARRAY['Machine Learning', 'Python'], ARRAY['Machine Learning for Healthcare', 'Data Analytics']),
('João Costa', 'PhD Researcher', 'active', 'scholarship', 'male', 'Portuguese', 'MSc', 1, ARRAY['NLP', 'Python'], ARRAY['Natural Language Processing']),
('Maria Ferreira', 'Researcher', 'former', 'contractor', 'female', 'Spanish', 'PhD', 2, ARRAY['Computer Vision'], ARRAY['Image Processing', 'Computer Vision']),
('Inês Rocha', 'Senior Researcher', 'active', 'employee', 'female', 'Portuguese', 'PhD', 4, ARRAY['Software Architecture', 'Java'], ARRAY['Microservices']),
('Tiago Ferreira', 'Researcher', 'active', 'employee', 'male', 'Portuguese', 'PhD', 4, ARRAY['Software Testing', 'Python'], ARRAY['Test Automation']),
('Beatriz Gomes', 'PhD Researcher', 'active', 'scholarship', 'female', 'Portuguese', 'MSc', 4, ARRAY['DevOps', 'Kubernetes'], ARRAY['Cloud Deployment']),
('Nuno Almeida', 'Software Engineer', 'active', 'contractor', 'male', 'Portuguese', 'MSc', 4, ARRAY['React', 'TypeScript'], ARRAY['Web Development']),
('Carla Dias', 'Software Engineer', 'active', 'contractor', 'female', 'Brazilian', 'BSc', 4, ARRAY['Python', 'FastAPI'], ARRAY['Backend Development']),
('Miguel Ribeiro', 'Project Manager', 'active', 'employee', 'male', 'Portuguese', 'MSc', 4, ARRAY['Scrum', 'Planning'], ARRAY['Project Management']),
('Sara Mendes', 'PhD Researcher', 'active', 'scholarship', 'female', 'Portuguese', 'MSc', 3, ARRAY['User Research', 'Figma'], ARRAY['Accessibility']),
('Rui Pereira', 'Software Engineer', 'active', 'contractor', 'male', 'Portuguese', 'BSc', 3, ARRAY['Android', 'Kotlin'], ARRAY['Mobile Apps']),
('Marta Lopes', 'Research Assistant', 'active', 'scholarship', 'female', 'Portuguese', 'MSc', 3, ARRAY['Usability Testing'], ARRAY['Co-design']),
('Clara Nunes', 'Senior Researcher', 'active', 'employee', 'female', 'Portuguese', 'PhD', 3, ARRAY['HCI', 'Statistics'], ARRAY['Human Factors', 'Accessibility']),
('Duarte Reis', 'PhD Researcher', 'active', 'scholarship', 'male', 'Portuguese', 'MSc', 3, ARRAY['Eye Tracking'], ARRAY['Interaction Design']),
('Hugo Carvalho', 'Researcher', 'active', 'employee', 'male', 'Portuguese', 'PhD', 6, ARRAY['OpenGL', 'C++'], ARRAY['Real-time Rendering']),
('Rita Moreira', 'PhD Researcher', 'active', 'scholarship', 'female', 'Italian', 'MSc', 6, ARRAY['Unity', 'VR'], ARRAY['Virtual Reality Training']),
('Diogo Teixeira', 'Research Assistant', 'active', 'contractor', 'male', 'Portuguese', 'MSc', 6, ARRAY['Blender', '3D Modelling'], ARRAY['Digital Heritage']),
('Sofia Pinto', 'Senior Researcher', 'active', 'employee', 'female', 'Portuguese', 'PhD', 6, ARRAY['Computer Graphics', 'VR'], ARRAY['Haptics', 'Virtual Reality']),
('Helena Cunha', 'Researcher', 'active', 'employee', 'female', 'Portuguese', 'PhD', 5, ARRAY['Databases', 'SQL'], ARRAY['Open Data']),
('Filipe Marques', 'PhD Researcher', 'active', 'scholarship', 'male', 'Portuguese', 'MSc', 5, ARRAY['Data Governance'], ARRAY['Metadata Quality']),
('Laura Neves', 'Administrative Assistant', 'active', 'employee', 'female', 'Portuguese', 'BSc', 5, ARRAY['Administration'], ARRAY[]::TEXT[]),
('Vasco Monteiro', 'Software Engineer', 'active', 'contractor', 'male', 'Portuguese', 'BSc', 5, ARRAY['PostgreSQL', 'Python'], ARRAY['Data Pipelines']),
('Teresa Fonseca', 'Research Assistant', 'active', 'scholarship', 'female', 'Portuguese', 'MSc', 5, ARRAY['Information Retrieval'], ARRAY['Digital Archives']),
('Ricardo Matos', 'Senior Researcher', 'active', 'employee', 'male', 'Portuguese', 'PhD', 7, ARRAY['Embedded C', 'FPGA'], ARRAY['Low-power Systems']),
('Catarina Lobo', 'PhD Researcher', 'active', 'scholarship', 'female', 'Spanish', 'MSc', 7, ARRAY['IoT', 'Rust'], ARRAY['Sensor Networks']),
('Bruno Faria', 'Research Assistant', 'active', 'scholarship', 'male', 'Portuguese', 'BSc', 7, ARRAY['Arduino', 'C'], ARRAY['Edge Computing']),
('Leonor Antunes', 'Software Engineer', 'active', 'contractor', 'female', 'Portuguese', 'MSc', 7, ARRAY['Linux', 'C++'], ARRAY['Firmware']),
('Lucas Moreau', 'Researcher', 'active', 'employee', 'male', 'French', 'PhD', 1, ARRAY['Deep Learning', 'PyTorch'], ARRAY['Medical AI']),
('Priya Nair', 'PhD Researcher', 'active', 'scholarship', 'female', 'Indian', 'MSc', 1, ARRAY['LLMs', 'Python'], ARRAY['AI Assistants']),
('Gonçalo Lima', 'Research Assistant', 'active', 'contractor', 'male', 'Portuguese', 'MSc', 1, ARRAY['MLOps', 'Docker'], ARRAY['Model Deployment']),
('Elena Popescu', 'Researcher', 'active', 'employee', 'female', 'Romanian', 'PhD', 2, ARRAY['Computer Vision', 'OpenCV'], ARRAY['Object Detection']),
('Daniel Sousa', 'PhD Researcher', 'active', 'scholarship', 'male', 'Portuguese', 'MSc', 2, ARRAY['Image Segmentation'], ARRAY['Medical Imaging']),
('Paulo Freitas', 'Software Engineer', 'active', 'contractor', 'male', 'Portuguese', 'BSc', 2, ARRAY['C++', 'CUDA'], ARRAY['GPU Computing']),
('Joana Martins', 'Researcher', 'active', 'employee', 'female', 'Portuguese', 'PhD', 7, ARRAY['Formal Methods'], ARRAY['Verification']),
('Vítor Sousa', 'Senior Researcher', 'active', 'employee', 'male', 'Portuguese', 'PhD', 5, ARRAY['Information Systems'], ARRAY['Enterprise Architecture']),
('Pedro Santos', 'Researcher', 'former', 'employee', 'male', 'Portuguese', 'PhD', 3, ARRAY['HCI'], ARRAY['Mobile Interaction']),
('André Correia', 'Software Engineer', 'former', 'contractor', 'male', 'Portuguese', 'BSc', 6, ARRAY['Unity'], ARRAY['Game Development']),
('Mariana Vaz', 'Research Assistant', 'former', 'scholarship', 'female', 'Portuguese', 'MSc', 8, ARRAY['R', 'Statistics'], ARRAY['Data Analysis']),
('Kenji Tanaka', 'Researcher', 'former', 'employee', 'male', 'Japanese', 'PhD', 8, ARRAY['Big Data', 'Spark'], ARRAY['Large-scale Analytics']),
('Lúcia Barros', 'PhD Researcher', 'former', 'scholarship', 'female', 'Portuguese', 'MSc', 8, ARRAY['Data Mining'], ARRAY['Recommender Systems']);

UPDATE teams SET leader_id = 1  WHERE id = 1;
UPDATE teams SET leader_id = 31 WHERE id = 2;
UPDATE teams SET leader_id = 13 WHERE id = 3;
UPDATE teams SET leader_id = 4  WHERE id = 4;
UPDATE teams SET leader_id = 19 WHERE id = 5;
UPDATE teams SET leader_id = 18 WHERE id = 6;
UPDATE teams SET leader_id = 24 WHERE id = 7;
UPDATE teams SET leader_id = 39 WHERE id = 8;

INSERT INTO researcher_contracts (researcher_id, type, start_date, end_date) VALUES
(1, 'Employment Contract', '2024-01-01', '2027-12-31'),
(2, 'Research Scholarship', '2025-09-01', '2027-08-31'),
(3, 'Fixed-term Contract', '2023-01-01', '2025-12-31'),
(4,  'Employment Contract',  CURRENT_DATE - 3200, NULL),
(5,  'Employment Contract',  CURRENT_DATE - 900,  CURRENT_DATE + 500),
(6,  'Research Scholarship', CURRENT_DATE - 1100, CURRENT_DATE + 45),
(7,  'Service Contract',     CURRENT_DATE - 1000, CURRENT_DATE - 401),
(7,  'Service Contract',     CURRENT_DATE - 400,  CURRENT_DATE + 230),
(8,  'Service Contract',     CURRENT_DATE - 60,   CURRENT_DATE + 300),
(9,  'Employment Contract',  CURRENT_DATE - 1800, NULL),
(10, 'Research Scholarship', CURRENT_DATE - 1400, CURRENT_DATE - 701),
(10, 'Research Scholarship', CURRENT_DATE - 700,  CURRENT_DATE + 400),
(11, 'Service Contract',     CURRENT_DATE - 300,  CURRENT_DATE + 20),
(12, 'Research Scholarship', CURRENT_DATE - 200,  CURRENT_DATE + 160),
(13, 'Employment Contract',  CURRENT_DATE - 2000, NULL),
(14, 'Research Scholarship', CURRENT_DATE - 40,   CURRENT_DATE + 1420),
(15, 'Employment Contract',  CURRENT_DATE - 1300, NULL),
(16, 'Research Scholarship', CURRENT_DATE - 800,  CURRENT_DATE + 600),
(17, 'Service Contract',     CURRENT_DATE - 250,  CURRENT_DATE + 75),
(18, 'Employment Contract',  CURRENT_DATE - 2500, NULL),
(19, 'Employment Contract',  CURRENT_DATE - 1000, NULL),
(20, 'Research Scholarship', CURRENT_DATE - 300,  CURRENT_DATE + 1100),
(21, 'Employment Contract',  CURRENT_DATE - 2200, NULL),
(22, 'Service Contract',     CURRENT_DATE - 150,  CURRENT_DATE + 12),
(23, 'Research Scholarship', CURRENT_DATE - 600,  CURRENT_DATE + 130),
(24, 'Employment Contract',  CURRENT_DATE - 2700, NULL),
(25, 'Research Scholarship', CURRENT_DATE - 900,  CURRENT_DATE + 300),
(26, 'Research Scholarship', CURRENT_DATE - 100,  CURRENT_DATE + 260),
(27, 'Service Contract',     CURRENT_DATE - 350,  CURRENT_DATE + 55),
(28, 'Employment Contract',  CURRENT_DATE - 1200, CURRENT_DATE - 501),
(28, 'Employment Contract',  CURRENT_DATE - 500,  CURRENT_DATE + 700),
(29, 'Research Scholarship', CURRENT_DATE - 230,  CURRENT_DATE + 900),
(30, 'Service Contract',     CURRENT_DATE - 180,  CURRENT_DATE + 85),
(31, 'Employment Contract',  CURRENT_DATE - 1500, NULL),
(32, 'Research Scholarship', CURRENT_DATE - 120,  CURRENT_DATE + 1300),
(33, 'Service Contract',     CURRENT_DATE - 500,  CURRENT_DATE + 190),
(34, 'Employment Contract',  CURRENT_DATE - 20,   CURRENT_DATE + 700),
(35, 'Employment Contract',  CURRENT_DATE - 75,   NULL),
(36, 'Employment Contract',  CURRENT_DATE - 1200, CURRENT_DATE - 60),
(37, 'Service Contract',     CURRENT_DATE - 700,  CURRENT_DATE - 110),
(38, 'Research Scholarship', CURRENT_DATE - 500,  CURRENT_DATE - 200),
(39, 'Employment Contract',  CURRENT_DATE - 2500, CURRENT_DATE - 150),
(40, 'Research Scholarship', CURRENT_DATE - 800,  CURRENT_DATE - 280);

INSERT INTO research_topics (name) VALUES
('Artificial Intelligence'),
('Data Science'),
('Computer Vision'),
('Human-Computer Interaction'),
('Software Engineering'),
('Information Systems'),
('Computer Graphics'),
('Embedded Systems');

INSERT INTO researcher_topics (researcher_id, topic_id) VALUES
(1, 1), (1, 2), (2, 1), (3, 3),
(4, 5), (5, 5), (6, 5), (7, 5), (8, 5), (9, 5),
(10, 4), (11, 4), (12, 4), (13, 4), (14, 4),
(15, 7), (16, 7), (17, 7), (18, 7), (18, 3),
(19, 6), (20, 6), (20, 2), (22, 6), (23, 6),
(24, 8), (25, 8), (26, 8), (27, 8), (34, 8),
(28, 1), (29, 1), (30, 1), (31, 3), (32, 3), (33, 3), (35, 6),
(36, 4), (37, 7), (38, 2), (39, 2), (40, 2);

INSERT INTO team_topics (team_id, topic_id) VALUES
(1, 1), (1, 2), (2, 3),
(2, 1), (3, 4), (4, 5), (4, 1), (5, 6), (5, 2), (6, 7), (6, 3), (7, 8), (8, 2);

INSERT INTO projects (name, status) VALUES
('HumanISE', 'active'),
('AI4Health', 'active'),
('HumanISE.info Dashboard', 'active'),
('CareLink', 'active'),
('DevBot', 'active'),
('VRTrain', 'active'),
('OpenGov Data', 'active'),
('EdgeGrid', 'active'),
('SmartVision', 'active'),
('LLM4Code', 'active'),
('MedImage', 'completed'),
('Museum3D', 'completed'),
('DataGov', 'completed'),
('AgriSense', 'planned'),
('OceanTwin', 'planned');

INSERT INTO researcher_project_assignments (researcher_id, project_id, allocation_percentage) VALUES
(1, 1, 60),
(1, 2, 30),
(2, 1, 100),
(4, 1, 40), (9, 1, 50),
(28, 2, 60), (29, 2, 100),
(5, 3, 50), (6, 3, 100), (7, 3, 100), (4, 3, 30), (9, 3, 50),
(13, 4, 60), (10, 4, 100), (12, 4, 80), (11, 4, 100),
(34, 5, 50), (30, 5, 50), (26, 5, 50),
(18, 6, 70), (16, 6, 100), (17, 6, 100),
(19, 7, 70), (20, 7, 100), (22, 7, 100), (23, 7, 60),
(24, 8, 80), (25, 8, 100), (26, 8, 50), (27, 8, 100),
(31, 9, 80), (32, 9, 100), (33, 9, 60), (28, 9, 40),
(5, 10, 50), (8, 10, 80), (30, 10, 50),
(3, 11, 100),
(37, 12, 100), (15, 12, 50),
(39, 13, 80), (38, 13, 100),
(19, 14, 20);
