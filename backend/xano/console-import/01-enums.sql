-- ENUMS ---------------------------------------------------------------

CREATE TYPE role_enum AS ENUM ('patient','pharmacy','admin','super_admin');
CREATE TYPE purpose_enum AS ENUM ('login','reset','link');
CREATE TYPE platform_enum AS ENUM ('ios','android','web');

CREATE TYPE approval_status_enum AS ENUM ('pending','approved','rejected','suspended');
CREATE TYPE document_type_enum AS ENUM ('business_registration','pharmacy_license','pharmacist_diploma','owner_id');
CREATE TYPE role_staff_enum AS ENUM ('owner','manager','staff');
CREATE TYPE document_status_enum AS ENUM ('pending','approved','rejected');

CREATE TYPE product_type_enum AS ENUM ('prescription','product','equipment');
CREATE TYPE request_status_enum AS ENUM ('submitted','expired','reserved','served','cancelled');
CREATE TYPE request_pharmacy_status_enum AS ENUM ('sent','viewed','responded');

CREATE TYPE response_status_enum AS ENUM ('available','reserved','rejected','expired');

CREATE TYPE reservation_state_enum AS ENUM ('submitted','ready','served','rejected','expired','cancelled');
CREATE TYPE waiting_state_enum AS ENUM ('ready','expired','served','cancelled');

CREATE TYPE notification_type_enum AS ENUM ('request','response','reservation','waiting','payment','subscription');

CREATE TYPE ticket_tier_enum AS ENUM ('tier1','tier2','tier3');
CREATE TYPE ticket_status_enum AS ENUM ('open','in_progress','resolved','closed');

CREATE TYPE subscription_status_enum AS ENUM ('trial','active','past_due','expired','cancelled');

CREATE TYPE payment_status_enum AS ENUM ('pending','authorized','succeeded','failed','refunded');
CREATE TYPE provider_enum AS ENUM ('orange_money','wave');
