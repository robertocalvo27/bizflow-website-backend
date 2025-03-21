const { AppDataSource } = require('./dist/database/data-source');
const { User } = require('./dist/models/User');

async function createAdmin() {
  try {
    // Inicializar conexión a la base de datos
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // Repositorio de usuarios
    const userRepository = AppDataSource.getRepository(User);

    // Verificar si ya existe el admin
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@bizflow.com' }
    });

    if (existingAdmin) {
      console.log('El usuario admin ya existe.');
      await AppDataSource.destroy();
      return;
    }

    // Crear admin
    const admin = userRepository.create({
      name: 'Administrador',
      email: 'admin@bizflow.com',
      password: 'admin123',
      role: 'admin'
    });

    await userRepository.save(admin);
    console.log('Usuario administrador creado con éxito!');
    
    // Cerrar conexión
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin(); 