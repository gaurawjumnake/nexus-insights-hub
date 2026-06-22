API Summary — http://localhost:8005
Health
Method	Path	Description
GET	/health	Server liveness check
Documents — /documents
Method	Path	Body / Params	Description
POST	/documents/upload	file (multipart), company_id (form), period (form)	Upload a document. Tabular files (csv/xlsx) go to financial_data + fact extraction. Narrative files (pdf/docx/md/txt) are parsed, chunked, and fact-extracted. KPIs are auto-calculated after upload.
GET	/documents/{document_id}	path: document_id	Fetch persisted chunks for a document (debug/status)
Upload response includes: document_id, chunks_saved, facts_extracted, observations_saved, kpis_calculated, kpi_periods, unmatched_columns

KPIs — /kpis
Method	Path	Body	Description
GET	/kpis/	—	List all KPIs across all companies
GET	/kpis/{company_id}/{period}	path params	Get KPI values for a specific company + period
POST	/kpis/extract	document_id, company_id, period	Re-run fact extraction on already-uploaded document
POST	/kpis/calculate	company_id, period, kpi_ids?	Recalculate KPIs from stored facts (optional filter by KPI IDs)
POST	/kpis/trend	company_id, kpi_ids[], period_type (month/quarter/year), start_period, end_period, save_results?	MoM/QoQ/YoY trend for one or more KPIs
POST	/kpis/insights	question, company_id, period, kpi_ids[]	LLM-generated executive analysis from KPI + fact data
Chat — /chat
Method	Path	Body	Description
POST	/chat/index/{document_id}	company_id, period?, file_name?	Index a document's chunks into the vector store (Chroma) for RAG
POST	/chat/query	message, contexts?[]	Direct RAG-only query against indexed documents
POST	/chat/ask	question, company_id?, period?	Orchestrated ask — auto-routes between SQL (financial data), RAG (documents), or registry lookup, then synthesises one answer
/chat/ask response includes: response, tools_used[], route_plan, sql_query_executed, iterations_hint

Key flows for the UI:
Upload → POST /documents/upload (returns KPIs inline, no extra call needed)
View KPIs → GET /kpis/{company_id}/{period}
Trend chart → POST /kpis/trend
AI chat → POST /chat/ask (smart routing, use this over /chat/query)
Executive report → POST /kpis/insights