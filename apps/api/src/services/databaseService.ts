import sqlite3 from 'sqlite3';
import path from 'path';
import { PaymentRecord, InstallmentPlan } from '../types';

export class DatabaseService {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || './database.sqlite';
    this.db = new sqlite3.Database(dbPath);
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create payments table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            total_amount REAL NOT NULL,
            payment_type TEXT NOT NULL CHECK (payment_type IN ('full', 'installment')),
            down_payment REAL,
            installment_count INTEGER,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create installments table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS installments (
            id TEXT PRIMARY KEY,
            payment_id TEXT NOT NULL,
            installment_number INTEGER NOT NULL,
            amount REAL NOT NULL,
            due_date DATE NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'processing')),
            transaction_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (payment_id) REFERENCES payments (id)
          )
        `);

        // Create indexes for better performance
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_installments_payment_id ON installments(payment_id)`);

        resolve();
      });
    });
  }

  async createPayment(payment: Omit<PaymentRecord, 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO payments (
          id, customer_name, customer_email, customer_phone, 
          total_amount, payment_type, down_payment, installment_count, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        payment.id,
        payment.customerName,
        payment.customerEmail,
        payment.customerPhone,
        payment.totalAmount,
        payment.paymentType,
        payment.downPayment,
        payment.installmentCount,
        payment.status
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(payment.id);
        }
      });

      stmt.finalize();
    });
  }

  async createInstallment(installment: Omit<InstallmentPlan, 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO installments (
          id, payment_id, installment_number, amount, due_date, status, transaction_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        installment.id,
        installment.paymentId,
        installment.installmentNumber,
        installment.amount,
        installment.dueDate,
        installment.status,
        installment.transactionId
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(installment.id);
        }
      });

      stmt.finalize();
    });
  }

  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM payments WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              id: row.id,
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerPhone: row.customer_phone,
              totalAmount: row.total_amount,
              paymentType: row.payment_type,
              downPayment: row.down_payment,
              installmentCount: row.installment_count,
              status: row.status,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getInstallmentsByPaymentId(paymentId: string): Promise<InstallmentPlan[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM installments WHERE payment_id = ? ORDER BY installment_number',
        [paymentId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const installments = rows.map(row => ({
              id: row.id,
              paymentId: row.payment_id,
              installmentNumber: row.installment_number,
              amount: row.amount,
              dueDate: row.due_date,
              status: row.status,
              transactionId: row.transaction_id,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            }));
            resolve(installments);
          }
        }
      );
    });
  }

  async updateInstallmentStatus(id: string, status: string, transactionId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE installments 
        SET status = ?, transaction_id = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);

      stmt.run([status, transactionId, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  async getPendingInstallments(): Promise<InstallmentPlan[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM installments 
         WHERE status = 'pending' AND due_date <= date('now') 
         ORDER BY due_date`,
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const installments = rows.map(row => ({
              id: row.id,
              paymentId: row.payment_id,
              installmentNumber: row.installment_number,
              amount: row.amount,
              dueDate: row.due_date,
              status: row.status,
              transactionId: row.transaction_id,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            }));
            resolve(installments);
          }
        }
      );
    });
  }

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE payments 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);

      stmt.run([status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  close(): void {
    this.db.close();
  }
}

export const databaseService = new DatabaseService();
