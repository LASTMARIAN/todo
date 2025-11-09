import express from 'express'
import cors from 'cors'
import pkg from 'pg'
import dotenv from 'dotenv'
import { pool } from '../helper/db.js'
import { auth } from '../helper/auth.js'
import { Router } from 'express'
import { getTasks } from '../controllers/TaskController.js'

const router = Router()

router.get("/",getTasks)

router.post('/create', auth,(req, res,next) => {
 const { task } = req.body
 if (!task) {
 return res.status(400).json({error: 'Task is required'})
 }
 pool.query('insert into task (description) values ($1) returning *', [task.description],
 (err, result) => {
 if (err) {
 return next(err)
 }
 res.status(201).json({id: result.rows[0].id, description: task.description})
 })
})


router.delete('/delete/:id', (req, res,next) => {
 const { id } = req.params
 pool.query('delete from task WHERE id = $1',
 [id],
 (err, result) => {
 if (err) {
 return next(err)
 }
 if (result.rowCount === 0) {
 const error = new Error('Task not found')
 error.status = 404
 return next(error)
 }
 return res.status(200).json({id:id})
 })
})

export default router