-- public.difficulty_levels definition

-- Drop table

-- DROP TABLE public.difficulty_levels;

CREATE TABLE public.difficulty_levels (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	level_name varchar(50) NOT NULL,
	time_limit int4 NOT NULL,
	CONSTRAINT difficulty_levels_level_name_key UNIQUE (level_name),
	CONSTRAINT difficulty_levels_pkey PRIMARY KEY (id)
);


-- public.modes definition

-- Drop table

-- DROP TABLE public.modes;

CREATE TABLE public.modes (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	mode_name varchar(50) NOT NULL,
	CONSTRAINT modes_mode_name_key UNIQUE (mode_name),
	CONSTRAINT modes_pkey PRIMARY KEY (id)
);


-- public.number_ranges definition

-- Drop table

-- DROP TABLE public.number_ranges;

CREATE TABLE public.number_ranges (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	range_name varchar(50) NOT NULL,
	CONSTRAINT number_ranges_pkey PRIMARY KEY (id),
	CONSTRAINT number_ranges_range_name_key UNIQUE (range_name)
);


-- public.operations definition

-- Drop table

-- DROP TABLE public.operations;

CREATE TABLE public.operations (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	operation_name varchar(50) NOT NULL,
	CONSTRAINT operations_operation_name_key UNIQUE (operation_name),
	CONSTRAINT operations_pkey PRIMARY KEY (id)
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	email varchar(255) NOT NULL,
	google_id varchar(255) NULL,
	apple_id varchar(255) NULL,
	password_hash varchar(255) NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);


-- public.sessions definition

-- Drop table

-- DROP TABLE public.sessions;

CREATE TABLE public.sessions (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NULL,
	mode_id uuid NULL,
	operation_id uuid NULL,
	range_id uuid NULL,
	difficulty_id uuid NULL,
	question_count int4 NOT NULL,
	overall_time_limit int4 NOT NULL,
	started_at timestamp DEFAULT now() NULL,
	ended_at timestamp NULL,
	is_completed bool DEFAULT false NULL,
	CONSTRAINT sessions_pkey PRIMARY KEY (id),
	CONSTRAINT sessions_difficulty_id_fkey FOREIGN KEY (difficulty_id) REFERENCES public.difficulty_levels(id),
	CONSTRAINT sessions_mode_id_fkey FOREIGN KEY (mode_id) REFERENCES public.modes(id),
	CONSTRAINT sessions_operation_id_fkey FOREIGN KEY (operation_id) REFERENCES public.operations(id),
	CONSTRAINT sessions_range_id_fkey FOREIGN KEY (range_id) REFERENCES public.number_ranges(id)
);


-- public.questions definition

-- Drop table

-- DROP TABLE public.questions;

CREATE TABLE public.questions (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	session_id uuid NULL,
	question_data jsonb NOT NULL,
	correct_answer varchar(255) NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT questions_pkey PRIMARY KEY (id),
	CONSTRAINT questions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);


-- public.user_answers definition

-- Drop table

-- DROP TABLE public.user_answers;

CREATE TABLE public.user_answers (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NULL,
	session_id uuid NULL,
	question_id uuid NULL,
	selected_answer varchar(255) NULL,
	is_correct bool NOT NULL,
	time_taken int4 NOT NULL,
	answered_at timestamp DEFAULT now() NULL,
	question_index int4 NULL,
	CONSTRAINT user_answers_pkey PRIMARY KEY (id),
	CONSTRAINT user_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
	CONSTRAINT user_answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
CREATE INDEX idx_user_answers_correctness ON public.user_answers USING btree (is_correct);