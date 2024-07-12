document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('shoe-form');
    const tableBody = document.querySelector('#shoes-table tbody');
    const popup = document.getElementById('image-popup');
    const popupImg = document.getElementById('popup-img');
    const fileInput = document.getElementById('image');
    const fileLabel = document.getElementById('file-label');  
    let editMode = false;

    // File input change handler
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        fileLabel.textContent = `${fileInput.files[0].name} selected`;
        fileLabel.classList.add('active');
      } else {
        fileLabel.textContent = 'Choose Image';
        fileLabel.classList.remove('active');
      }
    });
  
    async function loadCategories() {
      const response = await fetch('/categories');
      const categories = await response.json();
      const categorySelect = document.getElementById('category');
  
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const id = document.getElementById('shoe-id').value;
      const name = document.getElementById('name').value;
      const category_id = document.getElementById('category').value;
      const quantity = document.getElementById('quantity').value;
      const price = document.getElementById('price').value;
      const image = document.getElementById('image').files[0];
      const imageUrl = document.getElementById('image-url').value;
      const color = document.getElementById('color').value;
  
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category_id', category_id);
      formData.append('quantity', quantity);
      formData.append('price', price);
      formData.append('sold', false);
      formData.append('color', color);
      if (image) {
        formData.append('image', image);
      } else if (imageUrl) {
        formData.append('image', imageUrl);
      }
  
      const url = editMode ? `/shoes/${id}` : '/shoes';
      const method = editMode ? 'PUT' : 'POST';
  
      await fetch(url, {
        method,
        body: formData
      });
  
      form.reset();
      document.getElementById('image-url').value = '';
      loadShoes();
      editMode = false;
    });
    
    async function loadShoes() {
      const response = await fetch('/shoes');
      const shoes = await response.json();
      tableBody.innerHTML = '';
    
      shoes.forEach(shoe => {
        const row = document.createElement('tr');
        row.setAttribute('data-color', shoe.color); // Set color attribute
    
        row.innerHTML = `
          <td>${shoe.name}</td>
          <td>${shoe.category}</td>
          <td>${shoe.quantity}</td>
          <td>${shoe.price.toFixed(2)}</td>
          <td>
            ${shoe.image ? `<img src="${shoe.image}" alt="${shoe.name}" width="50" class="shoe-image">` : ''}
          </td>
          <td>
            <button class="toggle-sold" onclick="toggleSold(${shoe.id}, ${shoe.sold})">
              <i class="fa ${shoe.sold ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            </button>
          </td>
          <td><div class="color-display" style="background-color: ${shoe.color};"></div></td>
          <td>
            <button class="edit" onclick="editShoe(${shoe.id})">
              <i class="fa fa-edit" aria-hidden="true"></i>
            </button>
            <button class="delete" onclick="deleteShoe(${shoe.id})">
              <i class="fa fa-trash" aria-hidden="true"></i>
            </button>
          </td>
        `;
    
        tableBody.appendChild(row);
      });

      document.querySelectorAll('.shoe-image').forEach(img => {
        img.addEventListener('mouseover', (e) => {
          popupImg.src = e.target.src;
          popup.style.display = 'block';
          popup.style.top = `${e.clientY + 50}px`;
          popup.style.left = `${e.clientX + 50}px`;
        });
  
        img.addEventListener('mouseout', () => {
          popup.style.display = 'none';
        });
      });

    }
  
    
    window.editShoe = async (id) => {
      const response = await fetch(`/shoes/${id}`);
      const shoe = await response.json();
    
      document.getElementById('shoe-id').value = shoe.id;
      document.getElementById('name').value = shoe.name;
      document.getElementById('category').value = shoe.category_id;
      document.getElementById('quantity').value = shoe.quantity;
      document.getElementById('price').value = shoe.price;
      document.getElementById('image-url').value = shoe.image;
      document.getElementById('color').value = shoe.color;
    
      editMode = true;
    };
    
    window.deleteShoe = async (id) => {
      await fetch(`/shoes/${id}`, {
        method: 'DELETE'
      });
      loadShoes();
    };
    
    window.toggleSold = async (id, sold) => {
      await fetch(`/shoes/${id}/toggle-sold`, {
        method: 'PATCH'
      });
      loadShoes();
    };
    
    loadCategories();
    loadShoes();
});