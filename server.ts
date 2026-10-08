import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppDatabase, CommercialGoals, DEFAULT_GOALS, Sale, SaleType, User, VALID_CARGOS_FIJOS } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const BACKUPS_DIR = path.resolve(DATA_DIR, 'backups');
const DB_FILE = path.resolve(DATA_DIR, 'gilvexpro_db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Calculate Commission helper
export function calculateCommission(saleType: SaleType, cargoFijo: number | null, cantidad: number = 1): number {
  const qty = Math.max(1, Number(cantidad) || 1);
  let baseUnitCommission = 0;

  switch (saleType) {
    case 'Portabilidad':
      if (typeof cargoFijo === 'number' && cargoFijo > 0) {
        // 10% del Cargo Fijo mensual
        baseUnitCommission = Math.round((cargoFijo * 0.1) * 100) / 100;
      }
      break;
    case 'Alta':
    case 'Renovación':
      baseUnitCommission = 0; // Regla estándar S/ 0.00
      break;
    case 'CyC':
      baseUnitCommission = 30.0; // S/ 30.00 fijo
      break;
    case 'Mica':
      baseUnitCommission = 5.0; // S/ 5.00 fijo
      break;
    case 'Accesorios':
      baseUnitCommission = 10.0; // S/ 10.00 fijo
      break;
    case 'Prepago':
      baseUnitCommission = 1.0; // S/ 1.00 fijo
      break;
    default:
      baseUnitCommission = 0;
  }

  return Math.round(baseUnitCommission * qty * 100) / 100;
}

// Default initial database with CEO Gilberto
const INITIAL_DB: AppDatabase = {
  users: [
    {
      id: 'usr_gilberto_ceo',
      username: 'Gilberto',
      fullName: 'Gilberto (CEO Principal)',
      password: '0903',
      role: 'ceo',
      createdAt: new Date().toISOString(),
      active: true,
    },
    {
      id: 'usr_admin_lima',
      username: 'CarlosAdmin',
      fullName: 'Carlos Mendoza (Supervisor Norte)',
      password: '1234',
      role: 'admin',
      createdBy: 'usr_gilberto_ceo',
      createdAt: new Date().toISOString(),
      active: true,
    },
    {
      id: 'usr_asesor_1',
      username: 'mariana.sales',
      fullName: 'Mariana Flores',
      password: '1234',
      role: 'advisor',
      createdBy: 'usr_admin_lima',
      assignedAdminId: 'usr_admin_lima',
      createdAt: new Date().toISOString(),
      active: true,
    },
    {
      id: 'usr_asesor_2',
      username: 'juan.perez',
      fullName: 'Juan Pérez',
      password: '1234',
      role: 'advisor',
      createdBy: 'usr_gilberto_ceo',
      assignedAdminId: 'usr_gilberto_ceo',
      createdAt: new Date().toISOString(),
      active: true,
    },
  ],
  sales: [
    {
      id: 'sale_demo_1',
      advisorId: 'usr_asesor_1',
      advisorUsername: 'mariana.sales',
      advisorFullName: 'Mariana Flores',
      adminId: 'usr_admin_lima',
      saleType: 'Portabilidad',
      cantidad: 1,
      clientName: 'Roberto Gómez Bolaños',
      clientDni: '45892147',
      clientPhone: '984521741',
      cargoFijo: 69.9,
      cedente: 'Movistar',
      commission: 6.99,
      saleDate: '2026-03-10', // > 6 months ago to demonstrate renewal alert!
      createdAt: new Date('2026-03-10T14:20:00Z').toISOString(),
      notes: 'Cliente pasó de Movistar a Claro con plan 69.9',
      isRenewed: false,
    },
    {
      id: 'sale_demo_2',
      advisorId: 'usr_asesor_1',
      advisorUsername: 'mariana.sales',
      advisorFullName: 'Mariana Flores',
      adminId: 'usr_admin_lima',
      saleType: 'Alta',
      cantidad: 1,
      clientName: 'Lucía Benavides',
      clientDni: '71258963',
      clientPhone: '971452369',
      cargoFijo: 54.9,
      cedente: null,
      commission: 0,
      saleDate: '2026-02-15', // > 7 months ago
      createdAt: new Date('2026-02-15T11:15:00Z').toISOString(),
      notes: 'Línea nueva para su negocio',
      isRenewed: false,
    },
    {
      id: 'sale_demo_3',
      advisorId: 'usr_asesor_2',
      advisorUsername: 'juan.perez',
      advisorFullName: 'Juan Pérez',
      adminId: 'usr_gilberto_ceo',
      saleType: 'Portabilidad',
      cantidad: 1,
      clientName: 'Carlos Santillán',
      clientDni: '48963251',
      clientPhone: '956321478',
      cargoFijo: 89.9,
      cedente: 'Entel',
      commission: 8.99,
      saleDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      notes: 'Portabilidad completada exitosamente',
      isRenewed: false,
    },
    {
      id: 'sale_demo_4',
      advisorId: 'usr_asesor_2',
      advisorUsername: 'juan.perez',
      advisorFullName: 'Juan Pérez',
      adminId: 'usr_gilberto_ceo',
      saleType: 'CyC',
      cantidad: 1,
      clientName: 'Valeria Castro',
      clientDni: '74125896',
      clientPhone: '998877665',
      cargoFijo: null,
      cedente: null,
      commission: 30.0,
      saleDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      notes: 'Equipo financiado en cuotas',
      isRenewed: false,
    },
    {
      id: 'sale_demo_5',
      advisorId: 'usr_asesor_1',
      advisorUsername: 'mariana.sales',
      advisorFullName: 'Mariana Flores',
      adminId: 'usr_admin_lima',
      saleType: 'Accesorios',
      cantidad: 1,
      clientName: 'Daniel Morales',
      clientDni: '10293847',
      clientPhone: '912345678',
      cargoFijo: null,
      cedente: null,
      commission: 10.0,
      saleDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      notes: 'Audífonos Bluetooth Pro',
      isRenewed: false,
    },
  ],
  goals: DEFAULT_GOALS,
  lastBackupAt: new Date().toISOString(),
};

function readDb(): AppDatabase {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(INITIAL_DB);
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Ensure CEO Gilberto always exists
    const hasGilberto = parsed.users && parsed.users.some((u: User) => u.username.toLowerCase() === 'gilberto');
    if (!hasGilberto) {
      if (!parsed.users) parsed.users = [];
      parsed.users.unshift(INITIAL_DB.users[0]);
      writeDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB, using initial:', err);
    return INITIAL_DB;
  }
}

function writeDb(data: AppDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Automatic backup creation
function createBackup(type: 'auto' | 'manual' = 'auto'): string {
  try {
    const db = readDb();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `gilvexpro_${type}_backup_${timestamp}.json`;
    const targetPath = path.resolve(BACKUPS_DIR, filename);
    fs.writeFileSync(targetPath, JSON.stringify(db, null, 2), 'utf-8');
    
    db.lastBackupAt = new Date().toISOString();
    writeDb(db);
    return filename;
  } catch (err) {
    console.error('Error creating backup:', err);
    return '';
  }
}

// Initial backup if none exists
if (fs.existsSync(BACKUPS_DIR) && fs.readdirSync(BACKUPS_DIR).length === 0) {
  createBackup('auto');
}

// Auto backup interval every 30 minutes
setInterval(() => {
  createBackup('auto');
}, 30 * 60 * 1000);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Endpoints
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'GILVEXPRO CLOUD',
      time: new Date().toISOString(),
      dataSynced: true,
    });
  });

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const db = readDb();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Usuario no registrado.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Esta cuenta ha sido desactivada por el Administrador.' });
    }

    // Special check for Gilberto default or user password
    if (user.password !== password.trim()) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const { password: _, ...userSafe } = user;
    res.json({
      success: true,
      user: userSafe,
      token: `token_${user.id}_${Date.now()}`,
    });
  });

  // Register Advisor (from login screen tab "Registrar Asesor")
  app.post('/api/auth/register-advisor', (req: Request, res: Response) => {
    const { fullName, username, password, assignedAdminId } = req.body;
    if (!fullName || !username || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const db = readDb();
    const existing = db.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso. Elija otro.' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: username.trim(),
      fullName: fullName.trim(),
      password: password.trim(),
      role: 'advisor',
      assignedAdminId: assignedAdminId || 'usr_gilberto_ceo',
      createdBy: 'self-registration',
      createdAt: new Date().toISOString(),
      active: true,
    };

    db.users.push(newUser);
    writeDb(db);
    createBackup('auto');

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: 'Asesor registrado exitosamente',
      user: safeUser,
    });
  });

  // Users Management
  app.get('/api/users', (req: Request, res: Response) => {
    const db = readDb();
    // Return users without password or with password masked
    const sanitized = db.users.map((u) => {
      const { password, ...rest } = u;
      return { ...rest, hasPassword: !!password };
    });
    res.json(sanitized);
  });

  // Create User (CEO creates Admin or Advisor; Admin creates Advisor)
  app.post('/api/users', (req: Request, res: Response) => {
    const { fullName, username, password, role, assignedAdminId, createdBy } = req.body;
    if (!fullName || !username || !password || !role) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const db = readDb();
    if (db.users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: username.trim(),
      fullName: fullName.trim(),
      password: password.trim(),
      role,
      assignedAdminId: assignedAdminId || undefined,
      createdBy: createdBy || 'admin',
      createdAt: new Date().toISOString(),
      active: true,
    };

    db.users.push(newUser);
    writeDb(db);
    createBackup('auto');

    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  });

  // Update User
  app.put('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { fullName, password, role, active, assignedAdminId } = req.body;

    const db = readDb();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Do not allow deactivating or demoting Gilberto CEO
    if (db.users[index].username.toLowerCase() === 'gilberto' && (active === false || role !== 'ceo')) {
      return res.status(400).json({ error: 'El Administrador Principal (Gilberto) no puede ser desactivado ni degradado.' });
    }

    if (fullName) db.users[index].fullName = fullName;
    if (password) db.users[index].password = password;
    if (role) db.users[index].role = role;
    if (typeof active === 'boolean') db.users[index].active = active;
    if (assignedAdminId !== undefined) db.users[index].assignedAdminId = assignedAdminId;

    writeDb(db);
    const { password: _, ...safeUser } = db.users[index];
    res.json(safeUser);
  });

  // Delete User
  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const user = db.users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (user.username.toLowerCase() === 'gilberto') {
      return res.status(400).json({ error: 'No se puede eliminar la cuenta del CEO Principal Gilberto.' });
    }

    db.users = db.users.filter((u) => u.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Usuario eliminado' });
  });

  // Sales
  app.get('/api/sales', (req: Request, res: Response) => {
    const db = readDb();
    res.json(db.sales);
  });

  // Create Sale
  app.post('/api/sales', (req: Request, res: Response) => {
    const {
      advisorId,
      advisorUsername,
      advisorFullName,
      adminId,
      saleType,
      cantidad,
      clientName,
      clientDni,
      clientPhone,
      cargoFijo,
      cedente,
      saleDate,
      notes,
      renewedFromSaleId,
    } = req.body;

    if (!saleType || !clientName || !clientDni || !clientPhone || !saleDate) {
      return res.status(400).json({ error: 'Por favor complete los campos obligatorios del cliente y la venta.' });
    }

    const finalCantidad = Math.max(1, Number(cantidad) || 1);

    // Validation by SaleType
    if (['Portabilidad', 'Alta', 'Renovación'].includes(saleType)) {
      if (cargoFijo === undefined || cargoFijo === null || isNaN(Number(cargoFijo))) {
        return res.status(400).json({ error: `El Cargo Fijo es obligatorio para ventas de tipo ${saleType}.` });
      }
    }

    if (saleType === 'Portabilidad' && !cedente) {
      return res.status(400).json({ error: 'El operador Cedente (Movistar, Entel o Bitel) es obligatorio en Portabilidad.' });
    }

    const calculatedCommission = calculateCommission(saleType, cargoFijo ? Number(cargoFijo) : null, finalCantidad);

    const db = readDb();
    const newSale: Sale = {
      id: `sale_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      advisorId: advisorId || 'usr_gilberto_ceo',
      advisorUsername: advisorUsername || 'Gilberto',
      advisorFullName: advisorFullName || 'Gilberto',
      adminId: adminId || undefined,
      saleType,
      cantidad: finalCantidad,
      clientName: clientName.trim(),
      clientDni: clientDni.trim(),
      clientPhone: clientPhone.trim(),
      cargoFijo: ['Portabilidad', 'Alta', 'Renovación'].includes(saleType) ? Number(cargoFijo) : null,
      cedente: saleType === 'Portabilidad' ? cedente : null,
      commission: calculatedCommission,
      saleDate: saleDate, // YYYY-MM-DD
      createdAt: new Date().toISOString(),
      notes: notes ? notes.trim() : '',
      renewedFromSaleId: renewedFromSaleId || undefined,
      isRenewed: false,
    };

    // If this renewal came from a previous sale, mark the previous sale as renewed
    if (renewedFromSaleId) {
      const prev = db.sales.find((s) => s.id === renewedFromSaleId);
      if (prev) {
        prev.isRenewed = true;
      }
    }

    db.sales.unshift(newSale);
    writeDb(db);
    createBackup('auto');

    res.status(201).json(newSale);
  });

  // Update Sale
  app.put('/api/sales/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      saleType,
      cantidad,
      clientName,
      clientDni,
      clientPhone,
      cargoFijo,
      cedente,
      saleDate,
      notes,
    } = req.body;

    const db = readDb();
    const index = db.sales.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const current = db.sales[index];
    const finalSaleType = saleType || current.saleType;
    const finalCantidad = cantidad !== undefined ? Math.max(1, Number(cantidad) || 1) : (current.cantidad || 1);
    const finalCargoFijo = ['Portabilidad', 'Alta', 'Renovación'].includes(finalSaleType)
      ? (cargoFijo !== undefined ? Number(cargoFijo) : current.cargoFijo)
      : null;
    const finalCedente = finalSaleType === 'Portabilidad' ? (cedente || current.cedente) : null;
    const finalCommission = calculateCommission(finalSaleType, finalCargoFijo, finalCantidad);

    db.sales[index] = {
      ...current,
      saleType: finalSaleType,
      cantidad: finalCantidad,
      clientName: clientName !== undefined ? clientName.trim() : current.clientName,
      clientDni: clientDni !== undefined ? clientDni.trim() : current.clientDni,
      clientPhone: clientPhone !== undefined ? clientPhone.trim() : current.clientPhone,
      cargoFijo: finalCargoFijo,
      cedente: finalCedente,
      commission: finalCommission,
      saleDate: saleDate || current.saleDate,
      notes: notes !== undefined ? notes.trim() : current.notes,
    };

    writeDb(db);
    createBackup('auto');

    res.json(db.sales[index]);
  });

  // Delete Sale
  app.delete('/api/sales/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.sales.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    db.sales.splice(index, 1);
    writeDb(db);
    createBackup('auto');

    res.json({ success: true, message: 'Venta eliminada exitosamente' });
  });

  // Mark sale as renewed
  app.post('/api/sales/:id/mark-renewed', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const sale = db.sales.find((s) => s.id === id);
    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    sale.isRenewed = true;
    writeDb(db);
    res.json({ success: true, sale });
  });

  // Goals
  app.get('/api/goals', (req: Request, res: Response) => {
    const db = readDb();
    res.json(db.goals || DEFAULT_GOALS);
  });

  app.put('/api/goals', (req: Request, res: Response) => {
    const db = readDb();
    db.goals = {
      ...DEFAULT_GOALS,
      ...req.body,
    };
    writeDb(db);
    res.json(db.goals);
  });

  // Backups System
  app.get('/api/backups', (req: Request, res: Response) => {
    try {
      const files = fs.readdirSync(BACKUPS_DIR);
      const items = files
        .filter((f) => f.endsWith('.json'))
        .map((filename) => {
          const fullPath = path.resolve(BACKUPS_DIR, filename);
          const stat = fs.statSync(fullPath);
          let salesCount = 0;
          let usersCount = 0;
          try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            salesCount = content.sales?.length || 0;
            usersCount = content.users?.length || 0;
          } catch {
            // ignore
          }

          return {
            id: filename,
            filename,
            createdAt: stat.mtime.toISOString(),
            sizeBytes: stat.size,
            salesCount,
            usersCount,
            type: filename.includes('manual') ? 'manual' : 'auto',
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Error al listar respaldos' });
    }
  });

  // Trigger manual backup
  app.post('/api/backups/trigger', (req: Request, res: Response) => {
    const filename = createBackup('manual');
    if (!filename) {
      return res.status(500).json({ error: 'No se pudo generar el respaldo' });
    }
    res.json({ success: true, filename, message: 'Respaldo manual generado con éxito' });
  });

  // Restore backup from backup file
  app.post('/api/backups/restore/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    const targetPath = path.resolve(BACKUPS_DIR, filename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Archivo de respaldo no encontrado' });
    }

    try {
      const raw = fs.readFileSync(targetPath, 'utf-8');
      const parsed: AppDatabase = JSON.parse(raw);

      // Verify structure
      if (!Array.isArray(parsed.users) || !Array.isArray(parsed.sales)) {
        return res.status(400).json({ error: 'Formato de base de datos no válido' });
      }

      writeDb(parsed);
      res.json({ success: true, message: 'Base de datos restaurada correctamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error al restaurar respaldo' });
    }
  });

  // Export full JSON database
  app.get('/api/database/export', (req: Request, res: Response) => {
    const db = readDb();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="GILVEXPRO_DB_${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(db, null, 2));
  });

  // Import full JSON database
  app.post('/api/database/import', (req: Request, res: Response) => {
    const { data } = req.body;
    if (!data || !Array.isArray(data.users) || !Array.isArray(data.sales)) {
      return res.status(400).json({ error: 'Estructura de respaldo inválida. Debe contener "users" y "sales".' });
    }

    // Save backup first before overwrite
    createBackup('manual');
    writeDb(data);

    res.json({ success: true, message: 'Base de datos importada exitosamente' });
  });

  // Dev vs Prod Vite mounting
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GILVEXPRO CLOUD server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
