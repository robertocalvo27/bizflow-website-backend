# Comandos para conectar con GitHub

Una vez que hayas creado el repositorio en GitHub, ejecuta los siguientes comandos reemplazando `TU_USUARIO` con tu nombre de usuario de GitHub:

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/TU_USUARIO/bizflow-api.git

# Configurar la rama principal
git branch -M main

# Subir los cambios
git push -u origin main
```

## Comandos adicionales útiles

```bash
# Ver el estado del repositorio
git status

# Ver los repositorios remotos configurados
git remote -v

# Descargar cambios sin aplicarlos
git fetch origin

# Descargar y aplicar cambios
git pull origin main

# Crear una nueva rama y cambiar a ella
git checkout -b nombre-de-la-rama

# Cambiar a una rama existente
git checkout nombre-de-la-rama

# Subir una rama al repositorio remoto
git push origin nombre-de-la-rama
``` 