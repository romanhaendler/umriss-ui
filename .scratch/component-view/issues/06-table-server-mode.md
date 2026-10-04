# 06: Table: manual mode becomes server mode

**What to build:** The table over rows a server holds says what it is: `server` instead of `manual`, and it asks the server through `onRequest(request)` with the **Request** - search, conditions, sort, page, page size - instead of `onViewChange`. A width, an order, a pin or a fold asks the server nothing. The demo page is called 'Server mode'.

**Blocked by:** 05 (Table: a view applies by content)

**Status:** ready-for-agent

- [ ] Model test: no request on a width drag; one per request change
- [ ] Every type, warning and comment says server mode
- [ ] The five examples pass on the new names; the page is renamed and its old address resolves
