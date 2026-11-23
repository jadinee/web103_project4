import { Router } from 'express'
import {
  getAllDrinks,
  getDrinkById,
  saveDrink,
  deleteDrink
} from '../controllers/drinks.js'

const router = Router()

router.get('/', getAllDrinks)
router.get('/:id', getDrinkById)
router.post('/', saveDrink)
router.patch('/:id', saveDrink)
router.delete('/:id', deleteDrink)

export default router