import sql, { ConnectionPool, config as SQLConfig } from 'mssql'
import { env } from '@/env'

const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME } = env

const dbConfig: SQLConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  server: DB_SERVER,
  database: DB_NAME,
  port: DB_PORT,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  requestTimeout: 1000 * 30, // Tempo é em ms, então coloquei essa lógica de conta pois: 1000 ms * 30 = 30000 ms, que equivalem a 30 segundos
}

let pool: ConnectionPool

export async function getCofapConnection(): Promise<ConnectionPool> {
  if (pool) return pool

  try {
    pool = await sql.connect(dbConfig)
    console.log('✅ Conectado ao SQL Server!')
    return pool
  } catch (error) {
    console.error('❌ Erro na conexão com SQL Server:', error)
    throw error
  }
}
