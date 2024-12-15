# Ruta de la nueva imagen generada
new_image_path = "https://via.placeholder.com/400x200.png?text=Anime-Inspired-Rem"

# Actualizar el contenido del README para incluir la nueva imagen
final_readme_content = updated_readme_content.replace(
    "https://via.placeholder.com/400x200.png?text=Rem-Bot-MD",
    new_image_path
)

# Guardar el nuevo contenido en el archivo README.md
with open(readme_path, 'w', encoding='utf-8') as file:
    file.write(final_readme_content)

final_readme_content

