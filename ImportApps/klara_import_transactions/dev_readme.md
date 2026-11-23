
# Klara import extension

Dobbiamo sviluppare una nuova estensione di importazione per importare i movimenti di vendita da **KLARA (Klara.ch)** in Banana Contabilità.

Dobbiamo lavorare con i file forniti dal nostro cliente, che sono stati anonimizzati. I file sono stati originariamente esportati in formato Excel seguendo questa procedura:

Nell'interfaccia web di KLARA, accedere a **Sistema di cassa → Giornale → Mostra dettagli**, selezionare il periodo desiderato e cliccare su **«Scarica documenti»** nell'angolo in alto a destra. Da qui è possibile scaricare il giornale di cassa e le statistiche relative alle vendite.

Il cliente utilizza il sistema di cassa **POS di KLARA** e desidera importare settimanalmente nella contabilità le vendite registrate tramite il sistema di cassa. L'esportazione dovrebbe essere quello indicato nella doc seguente:
https://support.klara.ch/hc/en-us/articles/4416992415762-KLARA-POS-journal-web-version. Quindi il primo elemento 
della tabella.

Dovrebbe essere disponibile anche il **formato CSV**, che sarebbe preferibile rispetto a Excel.

## KLARA - Tipologie di esportazione e caso Furnari GmbH

**Verifica delle fonti:** 13 novembre 2026  
**Fonti:** documentazione ufficiale KLARA (support.klara.ch)

### 1. Tabella delle esportazioni per area gestionale

| Area gestionale | Esportazione | Dati / scopo | Formati esplicitamente documentati | Ultimo aggiornamento della fonte | Documentazione ufficiale |
|---|---|---|---|---|---|
| **Sistema di cassa (POS)** | **Kassenjournal - versione web** | Vendite e fatturato per sede; selezione del periodo, filtri e dettaglio delle vendite (articoli, IVA) | **CSV, Excel, PDF** | **10 novembre 2026** | [KLARA Kassenjournal (Webversion)](https://support.klara.ch/hc/de/articles/4416992415762-KLARA-Kassenjournal-Webversion) |
| Sistema di cassa (POS) | Tagesjournal / giornale giornaliero | Giornale giornaliero della cassa selezionata | **Non specificato** nella guida generale | **11 maggio 2026** | [Datenexport](https://support.klara.ch/hc/de/articles/360005033340-Datenexport) |
| **Contabilità finanziaria** | **Buchhaltungsjournal - giornale contabile** | Registrazioni contabili eseguite in KLARA, incluse quelle automatiche | **PDF** | **2 settembre 2026** | [Buchungen im Journal bearbeiten / löschen](https://support.klara.ch/hc/de/articles/360002412579-Buchungen-im-Journal-bearbeiten-l%C3%B6schen) |
| Contabilità finanziaria | Kontendetails - dettagli dei conti | Movimenti per conto, con data, contropartita, descrizione, imposta, Dare/Avere e saldo; opzione per tutti i conti | **Excel, PDF** | **2 settembre 2026** | [Buchhaltungsübersicht](https://support.klara.ch/hc/de/articles/360013453360-Buchhaltungs%C3%BCbersicht) |
| Contabilità finanziaria | Berichte - rapporti contabili | Rapporti di contabilità e documenti di chiusura, fra cui bilancio e conto economico | **PDF** (scaricamento documentato per i rapporti) | **11 maggio 2026** | [Datenexport](https://support.klara.ch/hc/de/articles/360005033340-Datenexport) |
| **Anagrafica articoli** | Artikelstamm | Elenco degli articoli; possibile successivo aggiornamento tramite reimportazione | **Excel** | **11 maggio 2026** | [Datenexport](https://support.klara.ch/hc/de/articles/360005033340-Datenexport) |
| **Clienti e partner** | Esportazioni clienti / partner | Statistiche, dati dei clienti e partner, annotazioni | **Non specificati** nella guida generale | **11 maggio 2026** | [Datenexport](https://support.klara.ch/hc/de/articles/360005033340-Datenexport) |
| **Azienda / salari** | Firma - Berichte | Documenti e rapporti generali dell'azienda, inclusi dati salariali | **Non specificati** nella guida generale | **11 maggio 2026** | [Datenexport](https://support.klara.ch/hc/de/articles/360005033340-Datenexport) |
| **Pagamenti (funzione distinta dai registri contabili)** | File di pagamento | Ordini di pagamento da trasferire all'e-banking | **pain.001** | **2 settembre 2026** | [Buchhaltungsübersicht](https://support.klara.ch/hc/de/articles/360013453360-Buchhaltungs%C3%BCbersicht) |


Domande da fare:
Il formato dedotto è corretto ?
