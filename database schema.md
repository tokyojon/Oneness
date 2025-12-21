create the complete schema in a .md file for the entire database




Reasoned

Reasoned
I'll list all tables across schemas to collect their definitions (table names and columns). I'll call list_tables for all schemas.


Ran list_tables

Reasoned
Database schema export (Markdown)
Below is the complete schema for the database (all schemas and tables returned). This file is ready to save as a .md file.

Database Schema (Project: edfixzjpvsqpebzehsqy)
Note: This is an automated export of table structures (schemas, tables, columns, types, defaults, checks, primary keys, foreign key references, and comments) as returned by the database metadata query.

Schemas present
pgbouncer
realtime
extensions
vault
graphql_public
graphql
auth
storage
public
custom_auth
auth.users
Comment: Auth: Stores user login data within a secure schema. Primary key: id Columns:

instance_id — uuid (nullable)
id — uuid
aud — character varying (nullable)
role — character varying (nullable)
email — character varying (nullable)
encrypted_password — character varying (nullable)
email_confirmed_at — timestamp with time zone (nullable)
invited_at — timestamp with time zone (nullable)
confirmation_token — character varying (nullable)
confirmation_sent_at — timestamp with time zone (nullable)
recovery_token — character varying (nullable)
recovery_sent_at — timestamp with time zone (nullable)
email_change_token_new — character varying (nullable)
email_change — character varying (nullable)
email_change_sent_at — timestamp with time zone (nullable)
last_sign_in_at — timestamp with time zone (nullable)
raw_app_meta_data — jsonb (nullable)
raw_user_meta_data — jsonb (nullable)
is_super_admin — boolean (nullable)
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
phone — text (nullable) — unique (default: NULL::character varying)
phone_confirmed_at — timestamp with time zone (nullable)
phone_change — text (nullable) (default: ''::character varying)
phone_change_token — character varying (nullable) (default: ''::character varying)
phone_change_sent_at — timestamp with time zone (nullable)
confirmed_at — timestamp with time zone (generated, nullable) (default: LEAST(email_confirmed_at, phone_confirmed_at))
email_change_token_current — character varying (nullable) (default: ''::character varying)
email_change_confirm_status — smallint (nullable) (default: 0) — check: email_change_confirm_status >= 0 AND email_change_confirm_status <= 2
banned_until — timestamp with time zone (nullable)
reauthentication_token — character varying (nullable) (default: ''::character varying)
reauthentication_sent_at — timestamp with time zone (nullable)
is_sso_user — boolean (updatable) (default: false) — comment: Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.
deleted_at — timestamp with time zone (nullable)
is_anonymous — boolean (updatable) (default: false)
Foreign keys referencing auth.users:

public.post_likes.user_id -> auth.users.id
auth.identities.user_id -> auth.users.id
auth.sessions.user_id -> auth.users.id
auth.mfa_factors.user_id -> auth.users.id
auth.one_time_tokens.user_id -> auth.users.id
auth.oauth_consents.user_id -> auth.users.id
auth.oauth_authorizations.user_id -> auth.users.id
public.post_comments.user_id -> auth.users.id
public.posts.user_id -> auth.users.id
public.user_bookmarks.user_id -> auth.users.id
public.post_shares.user_id -> auth.users.id
public.tip_transactions.sender_id -> auth.users.id
public.tip_transactions.recipient_id -> auth.users.id
public.marketplace_ads.user_id -> auth.users.id
public.marketplace_ad_likes.user_id -> auth.users.id
public.marketplace_ad_comments.user_id -> auth.users.id
public.marketplace_offers.user_id -> auth.users.id
public.marketplace_ad_views.user_id -> auth.users.id
public.marketplace_ad_clicks.user_id -> auth.users.id
public.direct_messages.sender_id -> auth.users.id
public.direct_messages.receiver_id -> auth.users.id
auth.refresh_tokens
Comment: Auth: Store of tokens used to refresh JWT tokens once they expire. Primary key: id Columns:

instance_id — uuid (nullable)
id — bigint (default: nextval('auth.refresh_tokens_id_seq'::regclass))
token — character varying (nullable) — unique
user_id — character varying (nullable)
revoked — boolean (nullable)
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
parent — character varying (nullable)
session_id — uuid (nullable)
Foreign keys:

auth.refresh_tokens.session_id -> auth.sessions.id
auth.instances
Comment: Auth: Manages users across multiple sites. Primary key: id Columns:

id — uuid
uuid — uuid (nullable)
raw_base_config — text (nullable)
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
auth.audit_log_entries
Comment: Auth: Audit trail for user actions. Primary key: id Columns:

instance_id — uuid (nullable)
id — uuid
payload — json (nullable)
created_at — timestamp with time zone (nullable)
ip_address — character varying (updatable) (default: ''::character varying)
auth.schema_migrations
Comment: Auth: Manages updates to the auth system. Primary key: version Columns:

version — character varying
storage.buckets
Primary key: id Columns:

id — text
name — text
owner — uuid (nullable) — comment: Field is deprecated, use owner_id instead
created_at — timestamp with time zone (nullable) (default: now())
updated_at — timestamp with time zone (nullable) (default: now())
public — boolean (nullable) (default: false)
avif_autodetection — boolean (nullable) (default: false)
file_size_limit — bigint (nullable)
allowed_mime_types — text[] (nullable)
owner_id — text (nullable)
type — USER-DEFINED buckettype (default: 'STANDARD'::storage.buckettype) — enums: STANDARD, ANALYTICS
Foreign keys:

storage.objects.bucket_id -> storage.buckets.id
storage.prefixes.bucket_id -> storage.buckets.id
storage.s3_multipart_uploads.bucket_id -> storage.buckets.id
storage.s3_multipart_uploads_parts.bucket_id -> storage.buckets.id
storage.objects
Primary key: id Columns:

id — uuid (default: gen_random_uuid())
bucket_id — text (nullable)
name — text (nullable)
owner — uuid (nullable) — comment: Field is deprecated, use owner_id instead
created_at — timestamp with time zone (nullable) (default: now())
updated_at — timestamp with time zone (nullable) (default: now())
last_accessed_at — timestamp with time zone (nullable) (default: now())
metadata — jsonb (nullable)
path_tokens — text[] (generated, nullable) (default: string_to_array(name, '/'::text))
version — text (nullable)
owner_id — text (nullable)
user_metadata — jsonb (nullable)
level — integer (nullable)
Foreign keys:

storage.objects.bucket_id -> storage.buckets.id
storage.migrations
Primary key: id Columns:

id — integer
name — character varying — unique
hash — character varying
executed_at — timestamp without time zone (nullable) (default: CURRENT_TIMESTAMP)
vault.secrets
Comment: Table with encrypted secret column for storing sensitive information on disk. Primary key: id Columns:

id — uuid (default: gen_random_uuid())
name — text (nullable)
description — text (updatable) (default: ''::text)
secret — text (updatable)
key_id — uuid (nullable)
nonce — bytea (nullable) (default: vault._crypto_aead_det_noncegen())
created_at — timestamp with time zone (updatable) (default: CURRENT_TIMESTAMP)
updated_at — timestamp with time zone (updatable) (default: CURRENT_TIMESTAMP)_
auth.identities
Comment: Auth: Stores identities associated to a user. Primary key: id Columns:

provider_id — text
user_id — uuid
identity_data — jsonb
provider — text
last_sign_in_at — timestamp with time zone (nullable)
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
email — text (generated, nullable) (default: lower((identity_data ->> 'email'::text))) — comment: Auth: Email is a generated column that references the optional email property in the identity_data
id — uuid (default: gen_random_uuid())
Foreign keys:

auth.identities.user_id -> auth.users.id
auth.sessions
Comment: Auth: Stores session data associated to a user. Primary key: id Columns:

id — uuid
user_id — uuid
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
factor_id — uuid (nullable)
aal — USER-DEFINED aal_level (nullable) — enums: aal1, aal2, aal3
not_after — timestamp with time zone (nullable) — comment: Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.
refreshed_at — timestamp without time zone (nullable)
user_agent — text (nullable)
ip — inet (nullable)
tag — text (nullable)
oauth_client_id — uuid (nullable)
refresh_token_hmac_key — text (nullable) — comment: Holds a HMAC-SHA256 key used to sign refresh tokens for this session.
refresh_token_counter — bigint (nullable) — comment: Holds the ID (counter) of the last issued refresh token.
Foreign keys:

auth.mfa_amr_claims.session_id -> auth.sessions.id
auth.refresh_tokens.session_id -> auth.sessions.id
auth.sessions.user_id -> auth.users.id
auth.sessions.oauth_client_id -> auth.oauth_clients.id
auth.mfa_factors
Comment: auth: stores metadata about factors Primary key: id Columns:

id — uuid
user_id — uuid
friendly_name — text (nullable)
factor_type — USER-DEFINED factor_type — enums: totp, webauthn, phone
status — USER-DEFINED factor_status — enums: unverified, verified
created_at — timestamp with time zone
updated_at — timestamp with time zone
secret — text (nullable)
phone — text (nullable)
last_challenged_at — timestamp with time zone (nullable) — unique
web_authn_credential — jsonb (nullable)
web_authn_aaguid — uuid (nullable)
last_webauthn_challenge_data — jsonb (nullable) — comment: Stores the latest WebAuthn challenge data including attestation/assertion for customer verification
Foreign keys:

auth.mfa_factors.user_id -> auth.users.id
auth.mfa_challenges.factor_id -> auth.mfa_factors.id
auth.mfa_challenges
Comment: auth: stores metadata about challenge requests made Primary key: id Columns:

id — uuid
factor_id — uuid
created_at — timestamp with time zone
verified_at — timestamp with time zone (nullable)
ip_address — inet (updatable)
otp_code — text (nullable)
web_authn_session_data — jsonb (nullable)
Foreign keys:

auth.mfa_challenges.factor_id -> auth.mfa_factors.id
auth.mfa_amr_claims
Comment: auth: stores authenticator method reference claims for multi factor authentication Primary key: id Columns:

session_id — uuid
created_at — timestamp with time zone
updated_at — timestamp with time zone
authentication_method — text (updatable)
id — uuid
Foreign keys:

auth.mfa_amr_claims.session_id -> auth.sessions.id
auth.sso_providers
Comment: Auth: Manages SSO identity provider information; see saml_providers for SAML. Primary key: id Columns:

id — uuid
resource_id — text (nullable) — check: resource_id = NULL::text OR char_length(resource_id) > 0 — comment: Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
disabled — boolean (nullable)
Foreign keys:

auth.saml_relay_states.sso_provider_id -> auth.sso_providers.id
auth.saml_providers.sso_provider_id -> auth.sso_providers.id
auth.sso_domains.sso_provider_id -> auth.sso_providers.id
auth.sso_domains
Comment: Auth: Manages SSO email address domain mapping to an SSO Identity Provider. Primary key: id Columns:

id — uuid
sso_provider_id — uuid
domain — text (updatable) — check: char_length(domain) > 0
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
Foreign keys:

auth.sso_domains.sso_provider_id -> auth.sso_providers.id
auth.saml_providers
Comment: Auth: Manages SAML Identity Provider connections. Primary key: id Columns:

id — uuid
sso_provider_id — uuid
entity_id — text (updatable, unique) — check: char_length(entity_id) > 0
metadata_xml — text (updatable) — check: char_length(metadata_xml) > 0
metadata_url — text (nullable, updatable) — check: metadata_url = NULL::text OR char_length(metadata_url) > 0
attribute_mapping — jsonb (nullable)
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
name_id_format — text (nullable)
Foreign keys:

auth.saml_providers.sso_provider_id -> auth.sso_providers.id
auth.saml_relay_states
Comment: Auth: Contains SAML Relay State information for each Service Provider initiated login. Primary key: id Columns:

id — uuid
sso_provider_id — uuid
request_id — text (updatable) — check: char_length(request_id) > 0
for_email — text (nullable)
redirect_to — text (nullable)
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
flow_state_id — uuid (nullable)
Foreign keys:

auth.saml_relay_states.flow_state_id -> auth.flow_state.id
auth.saml_relay_states.sso_provider_id -> auth.sso_providers.id
auth.flow_state
Comment: stores metadata for pkce logins Primary key: id Columns:

id — uuid
user_id — uuid (nullable)
auth_code — text (updatable)
code_challenge_method — USER-DEFINED code_challenge_method — enums: s256, plain
code_challenge — text (updatable)
provider_type — text (updatable)
provider_access_token — text (nullable, updatable)
provider_refresh_token — text (nullable, updatable)
created_at — timestamp with time zone (nullable)
updated_at — timestamp with time zone (nullable)
authentication_method — text (updatable)
auth_code_issued_at — timestamp with time zone (nullable)
Foreign keys:

auth.saml_relay_states.flow_state_id -> auth.flow_state.id
auth.one_time_tokens
Primary key: id Columns:

id — uuid
user_id — uuid
token_type — USER-DEFINED one_time_token_type — enums: confirmation_token, reauthentication_token, recovery_token, email_change_token_new, email_change_token_current, phone_change_token
token_hash — text (updatable) — check: char_length(token_hash) > 0
relates_to — text (updatable)
created_at — timestamp without time zone (updatable) (default: now())
updated_at — timestamp without time zone (updatable) (default: now())
Foreign keys:

auth.one_time_tokens.user_id -> auth.users.id
auth.oauth_clients
Primary key: id Columns:

id — uuid
client_secret_hash — text (nullable)
registration_type — USER-DEFINED oauth_registration_type — enums: dynamic, manual
redirect_uris — text (updatable)
grant_types — text (updatable)
client_name — text (nullable) — check: char_length(client_name) <= 1024
client_uri — text (nullable) — check: char_length(client_uri) <= 2048
logo_uri — text (nullable) — check: char_length(logo_uri) <= 2048
created_at — timestamp with time zone (updatable) (default: now())
updated_at — timestamp with time zone (updatable) (default: now())
deleted_at — timestamp with time zone (nullable)
client_type — USER-DEFINED oauth_client_type (updatable) (default: 'confidential'::auth.oauth_client_type) — enums: public, confidential
Foreign keys:

auth.oauth_consents.client_id -> auth.oauth_clients.id
auth.oauth_authorizations.client_id -> auth.oauth_clients.id
auth.sessions.oauth_client_id -> auth.oauth_clients.id
auth.oauth_authorizations
Primary key: id Columns:

id — uuid
authorization_id — text (updatable, unique)
client_id — uuid (updatable)
user_id — uuid (nullable, updatable)
redirect_uri — text (updatable) — check: char_length(redirect_uri) <= 2048
scope — text (updatable) — check: char_length(scope) <= 4096
state — text (nullable, updatable) — check: char_length(state) <= 4096
resource — text (nullable, updatable) — check: char_length(resource) <= 2048
code_challenge — text (nullable, updatable) — check: char_length(code_challenge) <= 128
code_challenge_method — USER-DEFINED code_challenge_method (nullable, updatable) — enums: s256, plain
response_type — USER-DEFINED oauth_response_type (updatable) (default: 'code'::auth.oauth_response_type) — enums: code
status — USER-DEFINED oauth_authorization_status (updatable) (default: 'pending'::auth.oauth_authorization_status) — enums: pending, approved, denied, expired
authorization_code — text (nullable, updatable, unique) — check: char_length(authorization_code) <= 255
created_at — timestamp with time zone (updatable) (default: now())
expires_at — timestamp with time zone (updatable) (default: (now() + '00:03:00'::interval))
approved_at — timestamp with time zone (nullable, updatable)
Foreign keys:

auth.oauth_authorizations.user_id -> auth.users.id
auth.oauth_authorizations.client_id -> auth.oauth_clients.id
auth.oauth_consents
Primary key: id Columns:

id — uuid
user_id — uuid
client_id — uuid
scopes — text (updatable) — check: char_length(scopes) <= 2048
granted_at — timestamp with time zone (updatable) (default: now())
revoked_at — timestamp with time zone (nullable, updatable)
Foreign keys:

auth.oauth_consents.user_id -> auth.users.id
auth.oauth_consents.client_id -> auth.oauth_clients.id
realtime.schema_migrations
Primary key: version Columns:

version — bigint
inserted_at — timestamp without time zone (nullable)
realtime.subscription
Primary key: id Columns:

id — bigint (identity ALWAYS)
subscription_id — uuid (updatable)
entity — regclass (updatable)
filters — realtime.user_defined_filter[] (updatable) (default: '{}'::realtime.user_defined_filter[])
claims — jsonb (updatable)
claims_role — regrole (generated, updatable) (default: realtime.to_regrole((claims ->> 'role'::text)))
created_at — timestamp without time zone (updatable) (default: timezone('utc'::text, now()))
storage.s3_multipart_uploads
Primary key: id Columns:

id — text
in_progress_size — bigint (updatable) (default: 0)
upload_signature — text (updatable)
bucket_id — text (updatable)
key — text (updatable)
version — text (updatable)
owner_id — text (nullable, updatable)
created_at — timestamp with time zone (updatable) (default: now())
user_metadata — jsonb (nullable, updatable)
Foreign keys:

storage.s3_multipart_uploads.bucket_id -> storage.buckets.id
storage.s3_multipart_uploads_parts.upload_id -> storage.s3_multipart_uploads.id
storage.s3_multipart_uploads_parts
Primary key: id Columns:

id — uuid (default: gen_random_uuid())
upload_id — text (updatable)
size — bigint (updatable) (default: 0)
part_number — integer (updatable)
bucket_id — text (updatable)
key — text (updatable)
etag — text (updatable)
owner_id — text (nullable, updatable)
version — text (updatable)
created_at — timestamp with time zone (updatable) (default: now())
Foreign keys:

storage.s3_multipart_uploads_parts.bucket_id -> storage.buckets.id
storage.s3_multipart_uploads_parts.upload_id -> storage.s3_multipart_uploads.id
storage.prefixes
Primary key: (bucket_id, name, level) Columns:

bucket_id — text
name — text
level — integer (generated, updatable) (default: storage.get_level(name))
created_at — timestamp with time zone (nullable, updatable) (default: now())
updated_at — timestamp with time zone (nullable, updatable) (default: now())
Foreign keys:

storage.prefixes.bucket_id -> storage.buckets.id
realtime.messages
Primary key: (inserted_at, id) RLS enabled: true Columns:

topic — text (updatable)
extension — text (updatable)
payload — jsonb (nullable)
event — text (nullable, updatable)
private — boolean (nullable, updatable) (default: false)
updated_at — timestamp without time zone (updatable) (default: now())
inserted_at — timestamp without time zone (updatable) (default: now())
id — uuid (updatable) (default: gen_random_uuid())
storage.buckets_analytics
Primary key: id Columns:

id — text
type — USER-DEFINED buckettype (updatable) (default: 'ANALYTICS'::storage.buckettype)
format — text (updatable) (default: 'ICEBERG'::text)
created_at — timestamp with time zone (updatable) (default: now())
updated_at — timestamp with time zone (updatable) (default: now())
public.users
RLS enabled: true Primary key: id Columns:

id — uuid (default: gen_random_uuid())
email — character varying (updatable) — unique
password_hash — character varying (updatable)
kyc_status — character varying (nullable, updatable) (default: 'pending'::character varying)
created_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
updated_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
Foreign keys referencing public.users:

public.user_notifications.user_id -> public.users.id
public.user_profiles.user_id -> public.users.id
public.points_ledger.user_id -> public.users.id
public.listings.user_id -> public.users.id
public.interactions.provider_user_id -> public.users.id
public.interactions.receiver_user_id -> public.users.id
public.evaluations.evaluator_user_id -> public.users.id
public.evaluations.target_user_id -> public.users.id
public.messages.sender_user_id -> public.users.id
public.ai_avatar_state.user_id -> public.users.id
public.user_profiles
Primary key: user_id RLS enabled: true Columns:

user_id — uuid
display_name — character varying (updatable)
bio — text (nullable)
avatar_url — text (nullable)
rank — character varying (nullable, updatable) (default: 'member'::character varying)
created_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
updated_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
banner_url — text (nullable)
Foreign keys:

public.user_profiles.user_id -> public.users.id
public.points_ledger
Primary key: id RLS enabled: true Columns:

id — bigint (default: nextval('points_ledger_id_seq'::regclass))
user_id — uuid
interaction_id — uuid (nullable)
amount — integer
type — character varying
created_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
Foreign keys:

public.points_ledger.user_id -> public.users.id
public.listings
Primary key: id RLS enabled: true Columns:

id — uuid (default: gen_random_uuid())
user_id — uuid
type — character varying (updatable) — check: type::text = ANY (ARRAY['offer'::character varying, 'request'::character varying]::text[])
title — text
description — text (nullable)
status — character varying (nullable, updatable) (default: 'active'::character varying)
created_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
updated_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
Foreign keys:

public.listings.user_id -> public.users.id
public.interactions.listing_id -> public.listings.id
public.interactions
Primary key: id RLS enabled: true Columns:

id — uuid (default: gen_random_uuid())
listing_id — uuid
provider_user_id — uuid
receiver_user_id — uuid
status — character varying (nullable, updatable) (default: 'pending'::character varying)
created_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
updated_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
Foreign keys:

public.interactions.receiver_user_id -> public.users.id
public.messages.interaction_id -> public.interactions.id
public.interactions.listing_id -> public.listings.id
public.evaluations.interaction_id -> public.interactions.id
public.interactions.provider_user_id -> public.users.id
public.evaluations
Primary key: id RLS enabled: true Columns:

id — bigint (default: nextval('evaluations_id_seq'::regclass))
interaction_id — uuid
evaluator_user_id — uuid
target_user_id — uuid
rating — integer — check: rating >= 1 AND rating <= 5
comment — text (nullable)
created_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
Foreign keys:

public.evaluations.evaluator_user_id -> public.users.id
public.evaluations.interaction_id -> public.interactions.id
public.evaluations.target_user_id -> public.users.id
public.messages
Primary key: id RLS enabled: true Columns:

id — uuid (default: gen_random_uuid())
interaction_id — uuid
sender_user_id — uuid
content — text
created_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
Foreign keys:

public.messages.sender_user_id -> public.users.id
public.messages.interaction_id -> public.interactions.id
public.user_notifications
Primary key: id RLS enabled: true Columns:

id — uuid (default: gen_random_uuid())
user_id — uuid
type — character varying
message — text
read — boolean (nullable, updatable) (default: false)
created_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
Foreign keys:

public.user_notifications.user_id -> public.users.id
public.ai_avatar_state
Primary key: id RLS enabled: true Columns:

id — uuid (default: gen_random_uuid())
user_id — uuid
state — jsonb
updated_at — timestamp without time zone (nullable, updatable) (default: CURRENT_TIMESTAMP)
Foreign keys:

public.ai_avatar_state.user_id -> public.users.id
custom_auth.config
Primary key: id Columns