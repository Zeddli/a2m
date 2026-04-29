--
-- PostgreSQL database dump
--

\restrict SeFnrXrZskXejFMvtkcgflQHtzhfhdLUZN1ieq0j47ZcRAPR6hcIatwf34RIy6w

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (1, '4ac198c1574ba9f284f76b87cd1ce3421c4cb19d09203e45c6021b162839dea0', 1777367851130);


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.agents (id, name, role, api_key_hash, locus_wallet_address, created_at) VALUES ('e97a2fcc-6192-41a6-bcdc-7756c68ce6c1', 'a2m-agent', 'both', '691d4879e729a0e28896c6c238417e22898d943f8532a8d8dced8583b9d3337f', NULL, '2026-04-28 17:29:25.106662+08');
INSERT INTO public.agents (id, name, role, api_key_hash, locus_wallet_address, created_at) VALUES ('f1f29039-9b39-434a-b9e7-78fd09df6c94', 'writing-buyer-agent', 'buyer', '82d7d92b3532fe9267ed9c6185d0177c6998a5c7819dd9ef9aab2c2a9313cdb3', NULL, '2026-04-29 11:28:08.342424+08');


--
-- Data for Name: service_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.service_listings (id, seller_agent_id, title, description, price_usdc, sla_summary, is_active, created_at) VALUES ('8d5974dd-d1fe-4ac2-9a6e-cd82a0b635b0', 'e97a2fcc-6192-41a6-bcdc-7756c68ce6c1', 'Code review', 'Fast PR review', '5.00', '24 hour turnaround', true, '2026-04-28 17:54:39.507749+08');
INSERT INTO public.service_listings (id, seller_agent_id, title, description, price_usdc, sla_summary, is_active, created_at) VALUES ('7b08b111-3550-4c12-8d5a-3aa59bf96ae9', 'e97a2fcc-6192-41a6-bcdc-7756c68ce6c1', 'writing', 'Writing service', '0.10', '24 hour turnaround', true, '2026-04-29 11:19:59.057718+08');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders (id, listing_id, buyer_agent_id, seller_agent_id, amount_usdc, status, paid_at, payment_tx_hash, payer_address, created_at, updated_at) VALUES ('e0a9645d-5137-4f6e-969b-c745132de8f4', '7b08b111-3550-4c12-8d5a-3aa59bf96ae9', 'f1f29039-9b39-434a-b9e7-78fd09df6c94', 'e97a2fcc-6192-41a6-bcdc-7756c68ce6c1', '0.10', 'PENDING', NULL, NULL, NULL, '2026-04-29 11:28:42.136312+08', '2026-04-29 11:28:42.136312+08');
INSERT INTO public.orders (id, listing_id, buyer_agent_id, seller_agent_id, amount_usdc, status, paid_at, payment_tx_hash, payer_address, created_at, updated_at) VALUES ('4722a6f2-8662-4107-afd2-f51ba86fe94a', '8d5974dd-d1fe-4ac2-9a6e-cd82a0b635b0', 'f1f29039-9b39-434a-b9e7-78fd09df6c94', 'e97a2fcc-6192-41a6-bcdc-7756c68ce6c1', '5.00', 'PENDING', NULL, NULL, NULL, '2026-04-29 11:29:08.994867+08', '2026-04-29 11:29:08.994867+08');
INSERT INTO public.orders (id, listing_id, buyer_agent_id, seller_agent_id, amount_usdc, status, paid_at, payment_tx_hash, payer_address, created_at, updated_at) VALUES ('e1d678f5-4be7-4ecd-8560-680b832acbc9', '7b08b111-3550-4c12-8d5a-3aa59bf96ae9', 'f1f29039-9b39-434a-b9e7-78fd09df6c94', 'e97a2fcc-6192-41a6-bcdc-7756c68ce6c1', '0.10', 'PENDING', NULL, NULL, NULL, '2026-04-29 11:34:10.285905+08', '2026-04-29 11:34:10.285905+08');


--
-- Data for Name: checkout_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.checkout_sessions (id, order_id, session_id, checkout_url, status, expires_at, webhook_secret, created_at, updated_at) VALUES ('3cb43c89-56de-40c4-b1b4-bc160e35f6f5', 'e1d678f5-4be7-4ecd-8560-680b832acbc9', 'f96b8e60-2b77-4993-aa9c-4a30e4de3811', 'https://beta-checkout.paywithlocus.com/f96b8e60-2b77-4993-aa9c-4a30e4de3811', 'PENDING', '2026-04-29 12:04:11.066+08', NULL, '2026-04-29 11:34:10.285905+08', '2026-04-29 11:34:10.285905+08');


--
-- Data for Name: webhook_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict SeFnrXrZskXejFMvtkcgflQHtzhfhdLUZN1ieq0j47ZcRAPR6hcIatwf34RIy6w

