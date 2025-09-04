-- Table: public.entities

-- DROP TABLE IF EXISTS public.entities;

CREATE TABLE IF NOT EXISTS public.entities
(
    id integer NOT NULL DEFAULT nextval('entities_id_seq'::regclass),
    type character varying(20) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    address text COLLATE pg_catalog."default",
    contact_no character varying(20) COLLATE pg_catalog."default",
    ipwis_no character varying(50) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    contact_person character varying(20) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT entities_pkey PRIMARY KEY (id),
    CONSTRAINT entities_type_check CHECK (type::text = ANY (ARRAY['generator'::character varying, 'transporter'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.entities
    OWNER to postgres;
	
================================================

-- Table: public.manifests

-- DROP TABLE IF EXISTS public.manifests;

CREATE TABLE IF NOT EXISTS public.manifests
(
    id integer NOT NULL DEFAULT nextval('manifests_id_seq'::regclass),
    date date,
    "time" time without time zone,
    transporter character varying(255) COLLATE pg_catalog."default",
    generator character varying(255) COLLATE pg_catalog."default",
    reference_no character varying(100) COLLATE pg_catalog."default",
    manifest_no character varying(100) COLLATE pg_catalog."default",
    waste_type character varying(100) COLLATE pg_catalog."default",
    waste_form character varying(100) COLLATE pg_catalog."default",
    process character varying(255) COLLATE pg_catalog."default",
    final_disposal character varying(255) COLLATE pg_catalog."default",
    planned_disposal_date date,
    actual_disposal_date date,
    disposal_ref_no character varying(100) COLLATE pg_catalog."default",
    quote_no character varying(100) COLLATE pg_catalog."default",
    po_no character varying(100) COLLATE pg_catalog."default",
    comments text COLLATE pg_catalog."default",
    username character varying(100) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    disposal_contact_no character varying(10) COLLATE pg_catalog."default",
    is_stamped boolean DEFAULT false,
    declaration_name character varying(50) COLLATE pg_catalog."default",
    declaration_date date,
    signature text COLLATE pg_catalog."default",
    disposal_email character varying(50) COLLATE pg_catalog."default",
    is_saved_for_later boolean DEFAULT false,
    CONSTRAINT manifests_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manifests
    OWNER to postgres;
	
==================================================

-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    userid integer NOT NULL DEFAULT nextval('users_userid_seq'::regclass),
    username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password_hash character varying(255) COLLATE pg_catalog."default" NOT NULL,
    date_created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reset_token text COLLATE pg_catalog."default",
    reset_token_expiry timestamp without time zone,
    is_verified boolean DEFAULT false,
    verification_token text COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (userid),
    CONSTRAINT unique_email UNIQUE (email),
    CONSTRAINT unique_username UNIQUE (username),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;
	
==================================================

-- Table: public.waste_streams

-- DROP TABLE IF EXISTS public.waste_streams;

CREATE TABLE IF NOT EXISTS public.waste_streams
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    manifest_id integer,
    description text COLLATE pg_catalog."default",
    packaging character varying(100) COLLATE pg_catalog."default",
    volume_l numeric,
    density_kg_l numeric,
    weight_kg numeric,
    CONSTRAINT waste_streams_pkey PRIMARY KEY (id),
    CONSTRAINT waste_streams_manifest_id_fkey FOREIGN KEY (manifest_id)
        REFERENCES public.manifests (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.waste_streams
    OWNER to postgres;