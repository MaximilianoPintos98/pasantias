import { pool } from '../db.js'

export const getTasks = async (req, res) => {
  const [result] = await pool.query('SELECT * FROM tasks ORDER BY created_at ASC')
  res.json(result)
}

export const getTask = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id])

    if (result.length === 0) return res.status(404).json({ message: 'Task not found' })

    res.send(result[0])
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body
    const [result] = await pool.query('INSERT INTO tasks(title, description) VALUES (?, ?)', [
      title,
      description
    ])

    res.send({
      id: result.insertId,
      title,
      description
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateTask = async (req, res) => {
  try {
    const { title, description, done, enabled } = req.body

    // Verifica si la tarea existe y está habilitada
    const [existingTask] = await pool.query('SELECT * FROM tasks WHERE id = ? AND enabled = true', [req.params.id])

    if (existingTask.length === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Actualiza la tarea con los datos proporcionados en el cuerpo de la solicitud
    const [result] = await pool.query('UPDATE tasks SET ? WHERE id = ?', [
      { title, description, done, enabled },
      req.params.id
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Obtén la tarea actualizada para enviarla en la respuesta
    const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id])

    res.json(updatedTask[0])
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteTask = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM tasks WHERE id = ? AND enabled = true', [req.params.id])

    if (result.length === 0) return res.status(404).json({ message: 'Task not found' })

    await pool.query('UPDATE tasks SET enabled = false WHERE id = ?', [req.params.id])

    res.json({ message: `Task ${result[0].id} deleted successfully` })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}
