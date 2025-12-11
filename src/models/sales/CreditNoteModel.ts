import SalesModel from '@/models/sales/SalesModel'
import type { CreditNote } from '@/types/models/sales/credit-note'

class CreditNoteModel extends SalesModel<CreditNote> {
  resource() {
    return 'credit-notes'
  }
}

export default CreditNoteModel
