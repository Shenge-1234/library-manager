function areIdentical(arr1, arr2){
  // checks whether arrays are identical
  if (arr1.length == arr2.length){
    return(arr1.every((value, index) => value === arr2[index]))
  };
};

window.onload = async() => {
  currentStatus();  
  };

  async function currentStatus(){
    let statusData = await eel.status()();

    /*this fxn return data object like this:
    book name: .......
    genre: .....
    total: ....
    available: .....
    in-service book: ....
    */

    // upper bar
    const topEl = document.querySelector('.top-bar');
    topEl.innerHTML = ''; // clear previous content

    // creating container
    const upperBar = document.createElement('div');
    
    //styling top Bar
    upperBar.style.display = 'flex';
    upperBar.style.justifyContent = 'flex-start';
    upperBar.style.position = 'sticky';
  
    // btns in upperBar
    const btnDiv1 = document.createElement('div');
    btnDiv1.className = 'upper-bar-btn-div';
    btnDiv1.style.width = 'auto';
    const addBookBtn = document.createElement('button');
    addBookBtn.className = 'upper-bar-btn';
    addBookBtn.textContent = 'Add Book'
    addBookBtn.onclick = bookRegister;
    btnDiv1.appendChild(addBookBtn);
    upperBar.appendChild(btnDiv1);
    
    const btnDiv2 = document.createElement('div');
    btnDiv2.className = 'upper-bar-btn-div';
    btnDiv2.style.width = 'auto';
    const lendBookBtn = document.createElement('button');
    lendBookBtn.className = 'upper-bar-btn';
    lendBookBtn.textContent = 'Lend Book';
    lendBookBtn.onclick = async function(params) {
      lendBook(false); // single lend
    } 
    btnDiv2.appendChild(lendBookBtn);
    upperBar.appendChild(btnDiv2);
    
    const btnDiv3 = document.createElement('div');
    btnDiv3.className = 'upper-bar-btn-div';
    btnDiv3.style.width = 'auto';
    const returnBookBtn = document.createElement('button');
    returnBookBtn.className = 'upper-bar-btn';
    returnBookBtn.textContent = 'Return Book';
    returnBookBtn.onclick = returnBook;
    btnDiv3.appendChild(returnBookBtn);
    upperBar.appendChild(btnDiv3);

    topEl.appendChild(upperBar);

    // main content layout
    const status = document.querySelector('.book-grid');
    status.innerHTML = ''; // clear previous content
    status.style.display = 'grid';
    status.style.columnGap = '50px';
    status.style.rowGap = '50px';
    status.style.paddingLeft = '13px';
    status.style.paddingTop = '50px';
    status.style.gridTemplateColumns = 'repeat(4, 300px)';
    status.style.gridTemplateRows = 'repeat(4, 400px)'
    
    const collectedBooks = statusData.total; // retrieving list of turples in status data from python fxn
    
    const formPopup = document.querySelector('.form-popup'); // the form

    if (collectedBooks.length == 0){ // if there is no book registered, display a welcome message

      status.style.display = 'block';
      status.innerHTML = ''; // clear previous content

      const welcomeP = document.createElement('p');
      welcomeP.textContent = 'Welcome to Library Manager.';
      status.appendChild(welcomeP);
      
    }else{ // books available then 
      const sortedData = {};
      collectedBooks.forEach(collectedBooks => {
        
        sortedData.name = collectedBooks[0];
        
        let allTableData = statusData.all_table;
        allTableData.forEach(data =>{
          if (data[2] == collectedBooks[0]){
            sortedData.genre = data[10];
            sortedData.img = data[data.length -3];
          };
        });
        
        sortedData.total = collectedBooks[1];
        
        let availableData = statusData.available_N;
        let availableNumber = 0;
        if(availableData !== 0 && availableData !== null && availableData !== undefined){
          // find the available number of books to display
          availableData.forEach(data =>{
            if (data[0] == collectedBooks[0]){
              availableNumber = data[1];
            };
          });
        };
          sortedData.available = availableNumber;
          
          let inserviceData = statusData.inservice;
          sortedData.inservice = 0; // initial be zero
          inserviceData.forEach(data =>{
            if (data[0] == collectedBooks[0]){
              sortedData.inservice =  data[1];
            }
          });
          
        let bookItem = document.createElement('button');
        bookItem.className = 'book-container';
        bookItem.style.display = 'grid';
        bookItem.style.gridTemplateRows = "1fr 1fr"
        bookItem.style.backgroundColor = 'white';
        bookItem.style.borderRadius = '10px';
        bookItem.style.padding = '0px';
        
        //image div
        const imgDiv = document.createElement('div');
        imgDiv.className = 'book-image-container';
        imgDiv.style.overflow = 'hidden';
        const imgEl = document.createElement('img');
        imgEl.src = sortedData.img;
        imgEl.style.width = '100%';
        imgEl.style.height = '100%';
        imgEl.style.objectFit = 'cover';
        imgDiv.appendChild(imgEl);
        bookItem.appendChild(imgDiv);
        
        // details container div
        const detailsDiv = document.createElement('div');
        detailsDiv.className = "bk-details-div";
        bookItem.appendChild(detailsDiv);


        const nameDiv = document.createElement('div');
        nameDiv.className = 'book-name';
        //name 
        const nameP = document.createElement('p');
        nameP.textContent = 'Book name: ' + sortedData.name;
        nameDiv.appendChild(nameP);
        detailsDiv.appendChild(nameDiv);
        
        const genreDiv = document.createElement('div');
        genreDiv.className = 'book-genre';
        // genre
        const genreP = document.createElement('p');
        genreP.textContent = 'Genre: ' + sortedData.genre;
        genreDiv.appendChild(genreP);
        detailsDiv.appendChild(genreDiv);

        const totalDiv = document.createElement('div');
        totalDiv.className = 'book-total';
        // total
        const totalP = document.createElement('p');
        totalP.textContent = 'Total: ' + sortedData.total;
        totalDiv.appendChild(totalP);  
        detailsDiv.appendChild(totalDiv);

        const availableDiv = document.createElement('div');
        availableDiv.className = 'book-available';
        //available
        const availableP = document.createElement('p');
        availableP.textContent = 'Available Books: ' + sortedData.available;
        availableDiv.appendChild(availableP);
        detailsDiv.appendChild(availableDiv);
        
        const inserviceDiv = document.createElement('div');
        inserviceDiv.className = 'book-inservice';
        //inservice
        const inServiceP = document.createElement('p');
        inServiceP.textContent = 'In-Service Books: ' + sortedData.inservice;
        inserviceDiv.appendChild(inServiceP);
        detailsDiv.appendChild(inserviceDiv);
      
        // append the book item to the status container
        status.appendChild(bookItem);  
        
        //clicking book functionalities
        bookItem.onclick = async function () {
          formPopup.innerHTML = '';
          formPopup.style.display = 'block';
          const formEl = document.createElement('form');

          const imgLabel = document.createElement('label');
          imgLabel.textContent = 'Change image ';
          const imgBar = document.createElement('input');
          imgBar.type = 'file';
          formEl.appendChild(imgLabel);
          formEl.appendChild(imgBar);
          formEl.appendChild(document.createElement('br'));
          
          const dltBtn = document.createElement('button');
          dltBtn.textContent = 'Remove this book from system';
          dltBtn.onclick = async function () {
            let theName = bookItem.querySelector('.book-name p').innerText.split(':')[1].trim();
            console.log(theName)
            let msg = await eel.remove_book(theName)();
            console.log(msg);
          };
          formEl.appendChild(dltBtn);
          formEl.appendChild(document.createElement('br'));

          const closeBtn = document.createElement('button');
          closeBtn.textContent = 'Close';
          closeBtn.onclick = async function(){
            formPopup.style.display = 'none';
          }

          formEl.appendChild(closeBtn);
          formPopup.appendChild(formEl);
          
        };
      });

      // search functionalities
      const getBookContainer = document.querySelectorAll('.book-container');
      const books = [];
      getBookContainer.forEach(bk =>{
        books.push({
          book: [bk.querySelector('.book-name p').innerText.split(":")[1].trim().toLowerCase(), bk.querySelector('.book-genre p').innerText.split(':')[1].trim().toLowerCase()],
          element: bk
        });
      });

      const searchContainer = document.querySelector('.search-container');
      searchContainer.style.display = 'block';
      const searchBar = document.querySelector('#search-bar');
      searchBar.placeholder = "Search by Book name or Genre";
      searchBar.addEventListener("input",e =>{
        let searchInput = e.target.value.toLowerCase();
        books.forEach(bkDetails =>{
          const isVisible = (bkDetails.book.some(bk => bk.includes(searchInput)));
          bkDetails.element.classList.remove('book-container');
          bkDetails.element.classList.toggle('hide', !isVisible);
        });
      });
    };
  };

  function bookRegister(){
    
    let statusElement = document.querySelector('.form-popup');
    statusElement.innerHTML = ''; // clear previous content
    statusElement.style.display = 'block';

    //form
    const form = document.createElement('form');
    form.id = 'book-register-form';
    
    //sn
    const snLabel = document.createElement('label');
    const sn = document.createElement('input');
    sn.type = 'text';
    sn.name = 'sn';
    sn.placeholder = 'Enter Book identifition';
    snLabel.textContent = 'Book identification ';
    sn.required = true; // make it required
    sn.prepend(snLabel);
    form.appendChild(snLabel);
    form.appendChild(sn);
    form.appendChild(document.createElement('br'));

    //book_name
    const nameLabel = document.createElement('label');
    const name = document.createElement("input");
    name.type = 'text';
    name.name = 'Name';
    name.placeholder = 'Enter Book name';
    nameLabel.textContent = 'Book Name ';
    name.required = true; // make it required
    form.appendChild(nameLabel);
    form.appendChild(name);
    form.appendChild(document.createElement('br'));
    
    //author
    const authorLabel = document.createElement('label');
    const author = document.createElement('input');
    author.type = 'text';
    author.name = 'Author';
    author.placeholder = 'Author Names';
    authorLabel.textContent = 'Author ';
    author.required = true; // make it required
    form.appendChild(authorLabel);
    form.appendChild(author);
    form.appendChild(document.createElement('br'));

    //date
    const dateLabel = document.createElement('label');
    const date = document.createElement('input');
    date.type = 'date';
    date.name = 'Published_date';
    dateLabel.textContent = 'Published Time ';
    date.required = true; // make it required
    form.appendChild(dateLabel);
    form.appendChild(date);
    form.appendChild(document.createElement('br'));

    //available
    const communice = document.createElement('label');
    communice.textContent = "Is Book ready to lend at the moment?   ";
    form.appendChild(communice);

    let labelValue = [{label: 'Yes', value: true}, {label: 'No', value: false}];
    labelValue.forEach(labelValue => {
      const radioLabel = document.createElement('label');
      
      const available = document.createElement('input');
      available.type = 'radio';
      available.name = 'Available';
      available.required = true; // make it required
      available.value = labelValue.value;

      radioLabel.textContent= ' '+ labelValue.label;
      radioLabel.prepend(available);
      form.appendChild(radioLabel);
      form.appendChild(available);
    });
    form.appendChild(document.createElement('br'));
    
    //genre
    const genreBar = document.createElement('select');
    genreBar.name = 'Genre';
    
    const genreLabel = document.createElement('label');
    genreLabel.textContent = 'Genre ';
    genreBar.prepend(genreLabel);
    form.appendChild(genreLabel);
    
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select genre';
    placeholder.disabled = true;
    placeholder.selected = true;
    genreBar.appendChild(placeholder);

    let genreValues = [{text: 'Science', value: 1 }, {text: 'Languages', value: 2 }, {text: 'Novels', value: 3 }, {text: 'History', value: 4 }];
    genreValues.forEach(genreValues =>{
      const option = document.createElement('option');
      option.textContent = genreValues.text;
      option.required = true; // make it required
      option.value = genreValues.value;
      genreBar.appendChild(option);
      form.appendChild(genreBar);
    });
    form.appendChild(document.createElement('br'));

    //entry_date
    const entryDateLabel = document.createElement('label');
    const entryDateBar = document.createElement('input');
    entryDateBar.type = 'date';
    entryDateBar.name = 'Entry_date';
    entryDateBar.placeholder = 'Book Entry time';
    entryDateBar.required = true; // make it required
    entryDateLabel.textContent = 'Entry time';
    entryDateBar.prepend(entryDateLabel);
    form.appendChild(entryDateLabel);
    form.appendChild(entryDateBar);
    form.appendChild(document.createElement('br'));

    // cover
    const coverLabel = document.createElement('label');
    const coverBar = document.createElement('input');
    coverBar.type = 'file';
    coverBar.name = 'Cover';
    coverBar.accept = 'image/*';
    coverLabel.textContent = 'Book cover ';
    coverBar.prepend(coverLabel)
    form.appendChild(coverLabel);
    form.appendChild(coverBar);
    form.appendChild(document.createElement('br'));

    //submit-btn
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'Submit';
    btn.textContent = 'Register';
    form.appendChild(btn);
    form.onsubmit = async function(e) {
      e.preventDefault();

     const enteredData = new FormData(form);
     const formData = {};
     let imgFile = null;
     enteredData.forEach(async(value, key) =>{
        if (key == 'Genre'){
          formData[key] = parseInt(value);
        }else if(key == 'Cover'){
          imgFile = value;
        }else{
          formData[key] = value;
        };
      });
      let base64 = null;
      if(imgFile.size !== 0){
        const reader = new FileReader();
        reader.onload = async function (e) {
          
          base64 = e.target.result; //get bs4 data(image)
          formData['Cover'] = await eel.upload_img(base64, imgFile.name, formData['Name'])(); //send into py
          await eel.save_data(formData)();
          await currentStatus();
          form.reset();
        }
        reader.readAsDataURL(imgFile);
      }else{
        formData['Cover'] = await eel.upload_img(null, null, formData['Name'])(); // use already obtained cover
        console.log(formData['Cover']);
        await eel.save_data(formData)();
        await currentStatus();
        form.reset();
      };
    }

    //close button
    const closeButton = document.createElement('button');
    closeButton.className = 'btn';
    closeButton.textContent = 'Close';
    closeButton.type = 'button';
    closeButton.onclick = function() {
      statusElement.style.display = 'none';
      statusElement.innerHTML = ''; // clear the form when closed
    };
    form.appendChild(closeButton);
    
    // append form to the status element

    statusElement.appendChild(form);
  };

  async function lendBook(multipleLend){

    // collect already borrowers in array
    let borrowersRecords = await eel.book_record()();
    let borrowers = [];
    for (let borrowersRecord of borrowersRecords){
      borrowers.push(borrowersRecord[8]); // get borrower id(user)
    };

    // form
    const formPopup = document.querySelector('.form-popup');
    formPopup.innerHTML = ''; // clear previous content
    formPopup.style.display = 'block';

    const formEl = document.createElement('form');
    
    const statusData = await eel.status()();

    // sn
    const snBarLabel = document.createElement('label');
    const snBar = document.createElement('select');
    snBarLabel.textContent = 'Book Identification: ';
    snBar.name = 'Book';
    snBar.placeholder = 'Select Book Identification(SN)';
    snBar.required = true; // make it required

    // sn options
    const bookItems = statusData.all_table;
    const neededData = {};

    // option placeholder
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select Book Identification(SN)';
    placeholder.disabled = true;
    placeholder.selected = true;
    snBar.appendChild(placeholder);

    // loop through bookItems to create options
    bookItems.forEach(bookItem => {
      if (bookItem !== null && bookItem !== undefined) {
        neededData['id'] = bookItem[0];
        neededData['sn'] = bookItem[1];
        neededData['name'] = bookItem[2];

        const option = document.createElement('option');
        option.textContent = neededData.sn + ' (' + neededData.name+ ')';
        option.value = neededData.id;
        snBar.appendChild(option);
      }else{
        const option = document.createElement('option');
        option.textContent = 'No book registered';
        option.value = '';
        option.disabled = true; // disable the option if no books are registered
        option.selected = false; // make it the default selected option
        snBar.appendChild(option);
      }
    });

    snBarLabel.prepend(snBar);
    formEl.appendChild(snBarLabel);
    formEl.appendChild(snBar);
    formEl.appendChild(document.createElement('br'));
    
    // borrower
    const borrowerBarLabel = document.createElement('label');
    const borrowerBar = document.createElement('select');
    borrowerBar.name = 'User ';
    borrowerBarLabel.textContent = 'Select Borrower: ';
    borrowerBar.required = true; // make it required
    
    // borrower placeholder options
    const placeholderBorrower = document.createElement('option');
    placeholderBorrower.value = '';
    placeholderBorrower.textContent = 'Select name';
    placeholderBorrower.disabled = true;
    placeholderBorrower.selected = true;
    borrowerBar.appendChild(placeholderBorrower);
    
    // loop through userData to create options
    const userData = await eel.get_users()();
    userData.forEach(user => {
      if (user !== null && user !== undefined) {
        const option = document.createElement('option');
        option.textContent = user[2];
        option.value = user[0]; // assuming user[0] is the user ID
        borrowerBar.appendChild(option);
      }else{
        const option = document.createElement('option');
        option.textContent = 'No user registered';
        option.value = '';
        option.disabled = true; // disable the option if no users are registered
        option.selected = false; // make it the default selected option
        borrowerBar.appendChild(option);
      };
    });
    
    borrowerBarLabel.prepend(borrowerBar);
    formEl.appendChild(borrowerBarLabel);
    formEl.appendChild(borrowerBar);
    formEl.appendChild(document.createElement('br'));
    
    //return time
    const returnTimeLabel = document.createElement('label');
    const returnTime = document.createElement('input');
    returnTimeLabel.textContent = 'Enter expected return Date: ';
    returnTime.type = 'date';
    returnTime.name = 'Estimated_return_time';
    returnTime.placeholder = 'Expect return Date';
    returnTime.required = true; // make it required
    returnTimeLabel.prepend(returnTime);
    formEl.appendChild(returnTimeLabel);
    formEl.appendChild(returnTime);
    formEl.appendChild(document.createElement('br'));

    //submit
    const subBut = document.createElement('button');
    subBut.className = 'btn';
    subBut.type = 'submit';
    subBut.textContent = 'Lend';
    formEl.appendChild(subBut);
    
    //close button
    const closeButton = document.createElement('button');
    closeButton.className = 'btn';
    closeButton.textContent = 'Close';
    closeButton.type = 'button';
    closeButton.onclick = function() {
      formPopup.style.display = 'none';
      formPopup.innerHTML = ''; // clear the form when closed
    };

    formEl.appendChild(closeButton);
    formPopup.appendChild(formEl);

    formEl.onsubmit = async function(e){
      e.preventDefault();

      const enteredLendData = new FormData(formEl);
      const lendFormData = {};
      enteredLendData.forEach((value, key) =>{
        lendFormData[key] = value;
      });
      if (multipleLend){

        let lend = await eel.save_lend(lendFormData)();
        currentStatus();
        formEl.reset();
      }else{
        // check if he already borrowed
        const hasBorrowed = borrowers.includes(lendFormData.user)
        if (hasBorrowed){
          alert("User areldy borrowed. use special lend instead")
          formEl.reset()
        }else{
          let lend = await eel.save_lend(lendFormData)();
          currentStatus();
          formEl.reset();
        }
      }
    };
  };
  
  async function returnBook(){
    const formPopup = document.querySelector('.form-popup');
    formPopup.innerHTML = ''; // clear previous content
    formPopup.style.display = 'block';

    const formEl = document.createElement('form');

    // sn
    const snBarLabel = document.createElement('label');
    const snBar = document.createElement('select');
    snBarLabel.textContent = 'Book Identification: ';
    snBar.name = 'Book';
    snBar.required = true; // make it required

    // placeholder for snBar
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select Book Identification(SN)';
    placeholder.disabled = true;
    placeholder.selected = true;
    snBar.appendChild(placeholder);

    // get the list of lent books
    const lentBooks = await eel.get_lent_books()();

    // loop through lentBooks to create options
    lentBooks.forEach(lentBook => {
      if (lentBook !== null && lentBook !== undefined) {
        const option = document.createElement('option');
        option.textContent = lentBook[1] + ' (' + lentBook[2] + ')'; // assuming lentBook[1] is the sn and lentBook[2] is the name
        option.value = lentBook[0]; // assuming lentBook[0] is the book ID
        snBar.appendChild(option);
      }else{
        const option = document.createElement('option');
        option.textContent = 'No book registered';
        option.value = '';
        option.disabled = true; // disable the option if no books are registered
        option.selected = false; // make it the default selected option
        snBar.appendChild(option);
      }
    });
    
    snBarLabel.prepend(snBar);
    formEl.appendChild(snBarLabel);
    formEl.appendChild(snBar);
    formEl.appendChild(document.createElement('br'));

    // return time
    const returnTimeLabel = document.createElement('label');
    const returnTime = document.createElement('input');
    returnTimeLabel.textContent = 'Enter Return Date: ';
    returnTime.type = 'date';
    returnTime.name = 'Return_time';
    returnTime.placeholder = 'Return Date';
    returnTime.required = true; // make it required
    returnTimeLabel.prepend(returnTime);
    formEl.appendChild(returnTimeLabel);
    formEl.appendChild(returnTime);
    formEl.appendChild(document.createElement('br'));

    //comment
    const commentLabel = document.createElement('label');
    const commentBar = document.createElement('input');
    commentBar.type = 'textarea';
    commentBar.name = 'Comment';  
    commentLabel.textContent = 'Comment: ';
    commentBar.required = true; // make it required
    commentBar.placeholder = 'Enter comment';
    commentLabel.prepend(commentBar);
    formEl.appendChild(commentLabel);
    formEl.appendChild(commentBar);
    formEl.appendChild(document.createElement('br'));

    //submit
    const subBut = document.createElement('button');
    subBut.className = 'btn';
    subBut.type = 'submit';
    subBut.textContent = 'Return';
    formEl.appendChild(subBut);

    //close button
    const closeButton = document.createElement('button');
    closeButton.className = 'btn';
    closeButton.textContent = 'Close';
    closeButton.type = 'button';
    closeButton.onclick = function() {
      formPopup.style.display = 'none';
      formPopup.innerHTML = ''; // clear the form when closed
    };

    // append form to the formPopup
    formEl.appendChild(closeButton);

    formPopup.appendChild(formEl);

    formEl.onsubmit = async function(e){
      e.preventDefault();

      const enteredReturnData = new FormData(formEl);
      const returnFormData = {};
      enteredReturnData.forEach((value, key) =>{
        returnFormData[key] = value;
      });
      let returnedBook = await eel.save_return(returnFormData)();
      currentStatus();
      formEl.reset();
    };
  };

  function registerUser(){
    const formPopup = document.querySelector('.form-popup');
    formPopup.innerHTML = ''; // clear previous content
    formPopup.style.display = 'block';

    const formEl = document.createElement('form');

    //categoty
    const categoryLabel = document.createElement('label');
    const categoryBar = document.createElement('select');
    categoryBar.name = 'Category';
    categoryLabel.textContent = 'Category ';
    categoryBar.required = true; // make it required
    
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select category';
    placeholder.disabled = true;
    placeholder.selected = true;  
    categoryBar.appendChild(placeholder);
    
    const categoryValues = [{text: 'Student', value: 1}, {text: 'Teacher', value: 2}, {text: 'Staff', value: 3}];
    categoryValues.forEach(categoryValues => {
      const option = document.createElement('option');
      option.textContent = categoryValues.text;
      option.value = categoryValues.value;
      categoryBar.appendChild(option);
    });
  
    categoryLabel.prepend(categoryBar);
    formEl.appendChild(categoryLabel);
    formEl.appendChild(categoryBar);
    formEl.appendChild(document.createElement('br'));

    //name
    const nameLabel = document.createElement('label');
    const nameBar = document.createElement('input');
    nameBar.type = 'text';
    nameBar.name = 'Name';
    nameBar.placeholder = 'Enter Name';
    nameBar.required = true; // make it required
    nameLabel.textContent = 'Name ';
    nameLabel.prepend(nameBar);
    formEl.appendChild(nameLabel);
    formEl.appendChild(nameBar);
    formEl.appendChild(document.createElement('br'));

    //gender
    const genderLabel = document.createElement('label');
    genderLabel.textContent = 'Click on gender ';
    formEl.appendChild(genderLabel);

    radioValues = [{label:'Male', value:'Male'}, {label:'Female', value:'Female'}] 
    radioValues.forEach(radioValues => {
      const radioLabel = document.createElement('label');
      const genderBar = document.createElement('input');
      genderBar.type = 'radio';
      genderBar.name = 'Gender';
      genderBar.required = true; // make it required
      genderBar.value = radioValues.value;
      
      radioLabel.textContent = ' ' + radioValues.label;
      radioLabel.prepend(genderBar);
      formEl.appendChild(radioLabel);
      formEl.appendChild(genderBar);
    });
    formEl.appendChild(document.createElement('br'));
    
    //submit
    const subBut = document.createElement('button');
    subBut.className = 'btn';
    subBut.type = 'submit';
    subBut.textContent = 'Register User';
    formEl.appendChild(subBut);

    // close button
    const closeButton = document.createElement('button');
    closeButton.className = 'btn';
    closeButton.textContent = 'Close';
    closeButton.type = 'button';
    closeButton.onclick = function() {
      formPopup.style.display = 'none';
      formPopup.innerHTML = ''; // clear the form when closed
    };
    // append close button to the form
    formEl.appendChild(closeButton);

    formPopup.appendChild(formEl);
    
    formEl.onsubmit = async function(e){
      e.preventDefault();

      const enteredUserData = new FormData(formEl);
      const userFormData = {};
      enteredUserData.forEach((value, key) =>{
        userFormData[key] = value;
      });

      formPopup.appendChild(formEl);

      let userRegistered = await eel.save_user(userFormData)();
      allUser()
      formEl.reset();
    };
  };

  async function inserviceRecord(){

    const spaceSelect = document.querySelector('.book-grid');
    spaceSelect.innerHTML = ''; // clear previous content
    spaceSelect.style.display = 'block';

    // upper bar
    const topEl = document.querySelector('.top-bar');
    topEl.innerHTML = ''; //clear the previous data
    const upperBar = document.createElement('div');
    upperBar.style.display = 'flex';
    upperBar.style.alignContent = 'flex-start';

    const btnDiv1 = document.createElement('div');
    btnDiv1.className = 'upper-bar-btn-div';
    btnDiv1.style.width = 'auto';
    const returnBookBtn = document.createElement('button');
    returnBookBtn.className = 'upper-bar-btn';
    returnBookBtn.textContent = 'Return Book';
    returnBookBtn.onclick = returnBook;
    btnDiv1.appendChild(returnBookBtn);
    upperBar.appendChild(btnDiv1);

    const recordData = await eel.book_record()();
    
    // count the name occurance in service table
    const firstValueCount = {}
    for (item of recordData){
      firstValueCount[item[0]] = (firstValueCount[item[0]] || 0) + 1;
    };
    
    if (recordData.length == 0 || !Object.entries(firstValueCount).some(n => n.includes(1))){
      const noRecord = document.createElement('p');
      noRecord.textContent = 'No Book lent yet.';
      noRecord.className = 'no-record';
      spaceSelect.appendChild(noRecord);
      return; // exit the function if no records are found
      
    }else{
      const tableElement = document.createElement('table');
      const tableHeader = document.createElement('thead');
      const headerRow = document.createElement('tr');
    
    const headers = ["Borrower's Name", 'Category', 'Book Names',"Book Identification", 'Lend Date', 'Expected Return','Return Deadline Status'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    tableHeader.appendChild(headerRow);
    tableElement.appendChild(tableHeader);
    
    // create table body
    const tableBody = document.createElement('tbody');
    const searchData = [];
    recordData.forEach(record => {
      
      if (firstValueCount[record[0]] == 1){
        const row = document.createElement('tr');
        row.className = 'inservive-record-row';

        searchData.push({
            element: row,
            cellsData: [record[0], record[2], record[3]]
        });
        
        // remove user id index(2)
        record.splice(2,1);

        // create a table cell for each data in the record
        record.forEach(data => {
          const td = document.createElement('td');
          td.textContent = data;
          row.appendChild(td);
        });
        tableBody.appendChild(row);
      }
    });

    // search functionality
    const searchContainer = document.querySelector('.search-container');
    searchContainer.style.display = 'block';
    const searchBar = document.querySelector('#search-bar');
    searchBar.placeholder = 'Search by User name, Book Name, or Book ID';
    if (searchData){
      searchBar.addEventListener('input', e =>{
        let searchInput = e.target.value.toLowerCase();
        searchData.forEach(data =>{
          let lowerRowData = data.cellsData.map(dt => dt.toLowerCase());
          let isVisible = !searchData || lowerRowData.some( stf => stf.includes(searchInput));
          data.element.classList.toggle('hide', !isVisible);
        });
      });
    }else{
      return;
    };

    topEl.appendChild(upperBar);

    tableElement.appendChild(tableBody);
    spaceSelect.appendChild(tableElement);
  };
};

async function specialLendForm(multipleLend){
  await lendBook(multipleLend);
};

async function specialFunctionalities(){
  const spaceSelect = document.querySelector('.book-grid');
  spaceSelect.innerHTML = ''; // clear previous content
  spaceSelect.style.display = 'grid';
  spaceSelect.style.gridTemplateColumns = 'repeat(2, 1fr)';

  // upper bar
  const topEl = document.querySelector('.top-bar');
  topEl.innerHTML = ''; //clear the previous data
  const upperBar = document.createElement('div');
  upperBar.style.display = 'flex';
  upperBar.style.justifyContent = 'space-around';

  const btnDiv1 = document.createElement('div');
  btnDiv1.className = 'upper-bar-btn-div';
  btnDiv1.style.width = 'auto';
  const returnBookBtn = document.createElement('button');
  returnBookBtn.className = 'upper-bar-btn';
  returnBookBtn.textContent = 'Return Book';
  returnBookBtn.onclick = returnBook;
  btnDiv1.appendChild(returnBookBtn);
  upperBar.appendChild(btnDiv1);

  const btnDiv2 = document.createElement('div');
  const specialLend = document.createElement('button');
  specialLend.className = 'upper-bar-btn';
  specialLend.textContent = 'Special Lend';
  specialLend.onclick = async function (params) {
    await specialLendForm(true);
  };
  btnDiv2.appendChild(specialLend);
  upperBar.appendChild(btnDiv2);

  // array for searsch function
  let tbDetail = [];

  // borrower table
  const recordData = await eel.book_record()();
  const firstValueCount = {};

  // count the name occurrence in service table
  for (item of recordData){
    firstValueCount[item[0]] = (firstValueCount[item[0]] || 0) + 1;
  };

  if (recordData.length == 0 || ! Object.values(firstValueCount).some(n => n >= 1)){
    const noRecord = document.createElement('p');
    noRecord.textContent = 'No Book lent yet.';
    noRecord.className = 'no-record';
    spaceSelect.appendChild(noRecord);
    return; // exit the function if no records are found
  }else{
    // name count obj
    let nameCount = {};
    for ( item of recordData){
      nameCount[item[0]] = (nameCount[item[0]]|| 0) + 1;
    };

    // collecting table data
    tableData = {};
    recordData.forEach(([name, category, userId, bookName, bookId, lendDate, returnDate]) => {
      if (nameCount[name] > 1){
        const groupingKey = name + ' - ' + category;
        if (!tableData[groupingKey]){
          tableData[groupingKey] = {
            name,
            category,
            rows: []
          };
        };
        tableData[groupingKey].rows.push([bookName, bookId, lendDate, returnDate]);
      }  
    });
  };

  for (const table of Object.entries(tableData)){
    const categoryValues = {1: 'Student', 2: 'Teacher', 3: 'Staff'};
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    table[1]['element'] = tableContainer;
    const title = document.createElement('h2');

    title.className = 'name-title';
    title.textContent = table[1].name + ' (' + categoryValues[table[1].category] + ')';
    tableContainer.appendChild(title);

    // create table & header element
    const tableEl = document.createElement('table');
    tableEl.className = 'record-table';
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const allHeader = ['Book name', 'Book identification', 'Lend Date', 'Expected return']
    allHeader.forEach(hd => {
      const hdCell = document.createElement('th');
      hdCell.textContent = hd;
      headerRow.appendChild(hdCell);
    });
    tableHeader.appendChild(headerRow);
    tableEl.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');

    table[1].rows.forEach(rowData => {
      const bodyRow = document.createElement('tr');
      rowData.forEach(data => {
        const dataCell = document.createElement('td');
        dataCell.textContent = data;
        bodyRow.appendChild(dataCell);
      });
      tableBody.appendChild(bodyRow);
    });
    tableEl.appendChild(tableBody);
    tableContainer.appendChild(tableEl);
    spaceSelect.appendChild(tableContainer);
  }

  topEl. appendChild(upperBar);

  // search functionality
  const searchContainer = document.querySelector('.search-container');
  searchContainer.style.display = 'block';
  const searchBar = document.querySelector('#search-bar');
  searchBar.placeholder = 'Search by Book id, Name and User Name';
  let searchData = []; // extracting search data
  for (const [k,v] of Object.entries(tableData)){
    searchData.push({
      name: v.name,
      element: v.element,
      details:  v.rows.map(([bkName, bkId, lendTime, returnTime]) => [bkName, bkId])
    });  
  };

  searchBar.addEventListener('input', e =>{
    let searchInput = e.target.value.toUpperCase();
    searchData.forEach(data =>{
      const bookWithId = data.details.flat();
      const upperBookWithId = bookWithId.map(stf => stf.toUpperCase());
      const isMatch = (upperBookWithId.some(bkId => bkId.includes(searchInput) || data.name.toUpperCase().includes(searchInput)));
      data.element.classList.toggle('hide', ! isMatch);
    }); 
  });
  
  tableData = {}; // reset the tableData object for the next iteration
}
    
async function allUser() {
  const spaceSelect = document.querySelector('.book-grid');
  spaceSelect.innerHTML = ''; // clear previous content
  spaceSelect.style.display = 'block';

  // upper bar
  const topEl = document.querySelector('.top-bar');
  topEl.innerHTML = ''; //clear the previous data
  const upperBar = document.createElement('div');
  upperBar.style.display = 'flex';
  upperBar.style.alignContent = 'flex-start';

  // register btn
  const btnDiv2 = document.createElement('div');
  const registerBtn = document.createElement('button');
  registerBtn.className = 'upper-bar-btn';
  registerBtn.textContent = 'Register User';
  registerBtn.onclick = registerUser;
  btnDiv2.appendChild(registerBtn);
  upperBar.appendChild(btnDiv2);

  // the table element
  const tableElement = document.createElement('table');
  const tableHeader = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ["","User Name", "Category", "Gender"]
  headers.forEach(thData =>{
    const th = document.createElement('th');
    th.textContent = thData;
    headerRow.appendChild(th);
  });
  tableHeader.appendChild(headerRow);
  tableElement.appendChild(tableHeader);

  const searchData = []
  const tableBody = document.createElement('tbody');
  tableBody.className = 'users';
  const rowData = await eel.get_users_data()();
  rowData.forEach(row =>{
    const rowEl = document.createElement('tr');
    const slt = document.createElement('td');
    slt.className = 'user-check-box-cell';
    rowEl.appendChild(slt);

    searchData.push({
      element: rowEl,
      userDetails: [row[0],row[1]]
    });

    row.forEach(data =>{
      const cell = document.createElement('td');
      cell.textContent = data;
      rowEl.appendChild(cell);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'last-cell-btn';

    deleteBtn.onclick = async function(params) {
      let cellEl = rowEl.querySelectorAll('td');
      const cellElData = Array.from(cellEl).map(cl => cl.innerText);
      cellElData.shift(); // remove the first empty string
      if (areIdentical(cellElData, row)){
        const dlted = await eel.delete_user(arr=row)();
        allUser();
      };
    };
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'last-cell-btn';
    
    const currentRowData = Array.from(rowEl.children).map(td => td.innerText);
    currentRowData.shift(); // ignore the first empty column
    editBtn.onclick = async function (params) {
      const editRow = rowEl.closest('tr');
      const allCells = Array.from(editRow.querySelectorAll('td'));
      allCells.shift();
      const lastCellBtns = document.querySelectorAll('.last-cell-btn')
      lastCellBtns.forEach(btn => {
        btn.classList.toggle('hide');
      });
      
      //cells edit bars
      const nameBar = document.createElement('input');
      nameBar.type = 'text'
      const existedName = allCells[0].innerText;
      nameBar.defaultValue = existedName;
      allCells[0].textContent = null;
      allCells[0].appendChild(nameBar);
      
      const categoryBar = document.createElement('select');
      const existedCat = allCells[1].innerText;
      const allCategories = await eel.get_categories()();
      allCategories.forEach(([val,cat]) =>{
        const option = document.createElement('option');
        option.textContent = cat;
        option.value = val;
        option.selected = (existedCat == cat)? true: false;
        categoryBar.appendChild(option)
      });
      allCells[1].textContent = null; // remove already data in cell
      allCells[1].appendChild(categoryBar);
      
      const labelValue = [{label: 'F', value: 'Female'}, {label: 'M', value: 'Male'}];
      const existedGender = allCells[2].innerText;
      labelValue.forEach(obj =>{
        const label = document.createElement('label');
        label.textContent = obj.label;
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'Gender';
        radio.checked = (existedGender === obj.value) ? true: false;
        console.log(radio.checked, allCells[2].innerText,obj.value );
        radio.value = obj.value;
        allCells[2].appendChild(radio);
        allCells[2].appendChild(label);
      });
      
      const submitBtn = document.createElement('button');
      submitBtn.textContent = 'Done';
      submitBtn.onclick = async function() {
        let edited = {};
        edited['Name'] = allCells[0].querySelector('input').value;
        edited['Category'] = allCells[1].querySelector('select').value;
        edited['Gender'] = allCells[2].querySelector('input[type="radio"]:checked').value;

        let beforeEdit = {};
        beforeEdit['Name'] = currentRowData[0];

        const parseCatId = await eel.get_categories()();
        // replace id with categoey
        parseCatId.forEach(([val,cat]) => {

          if (cat == currentRowData[1]){
            beforeEdit['Category'] = val;
          };
        });

        beforeEdit['Gender'] = currentRowData[2];
        console.log(beforeEdit, edited);
        const update = await eel.edit_user(beforeEdit, edited)();
        allUser();
      };
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Ignore';
      closeBtn.onclick = async function(params) {
        allUser();
      };
      
      editRow.appendChild(submitBtn);
      editRow.appendChild(closeBtn);  
    };
    
    rowEl.appendChild(editBtn);
    rowEl.appendChild(deleteBtn);
    
    tableBody.appendChild(rowEl);
  });
  
  // select btn
  const btnDiv1 = document.createElement('div');
  const selectBtn = document.createElement('button');
  selectBtn.className = 'upper-bar-btn';
  selectBtn.textContent = 'Select'
  const selectedUser = new Set();
  selectBtn.onclick = async function(params) {
    const getButtons = document.querySelectorAll('.last-cell-btn')

    getButtons.forEach(btn =>{
      btn.classList.toggle('hide', true);
    });
    if (! document.getElementById('select-btn')){

      // ignore selection btn
      const btnDiv5 = document.createElement('div');
      const ignoreSltBtn = document.createElement('button');
      ignoreSltBtn.className = 'upper-bar-btn';
      ignoreSltBtn.id = 'select-btn';
      ignoreSltBtn.textContent = 'Ignore';
      ignoreSltBtn.onclick = async function (params) {
        allUser() ;
      };
      btnDiv5.appendChild(ignoreSltBtn);
      upperBar.appendChild(btnDiv5);

      //delete selected btn
      const btnDiv4 = document.createElement('div');
      const dltSelectedBtn = document.createElement('button');
      dltSelectedBtn.className = 'upper-bar-btn';
      dltSelectedBtn.id = 'delete-selected-btn';
      dltSelectedBtn.textContent = 'Delete Selected';
      dltSelectedBtn.style.display = 'none';
      const users = [];
      const decodeCategory = {'Student': 1, 'Teacher': 2, 'Staff': 3};
      dltSelectedBtn.onclick = async function (params) {
        let usersDetails = [];
        if (Array.from(selectedUser).length !== 0){
          Array.from(selectedUser).forEach(row =>{
            let cells = row.querySelectorAll('td');
            let sortedCells = Array.from(cells).slice(1); // ignore first empty string
            usersDetails.push(sortedCells.map(dt => dt.innerText));
          });
          
          for (const selectedUser of usersDetails){
            await eel.delete_user(selectedUser)();
          }
        };
        allUser();
      };

      btnDiv4.appendChild(dltSelectedBtn);
      upperBar.appendChild(btnDiv4);
    }

    let getTheCells = document.querySelectorAll('.user-check-box-cell');
    Array.from(getTheCells).forEach(checkCell =>{
      if (checkCell.children.length == 0){
        let checkeBox = document.createElement('input');
        checkeBox.type = 'checkbox';
        checkeBox.className = 'user-check-box';
        checkCell.appendChild(checkeBox);
      };
    });

    const boxes = document.querySelectorAll('.user-check-box');

    boxes.forEach(box =>{
      box.addEventListener('change', e =>{
        const row = e.target.closest('tr');
        if (e.target.checked){
          selectedUser.add(row);
          const dltBtn = document.querySelector('#delete-selected-btn');
          dltBtn.style.display = 'block';
        }else{
          selectedUser.delete(row);
        };
      });
    }); 
  };
  btnDiv1.appendChild(selectBtn);
  upperBar.appendChild(btnDiv1);
  topEl.appendChild(upperBar);

  //search bar
  const searchContainer = document.querySelector('.search-container');
  searchContainer.style.disabled = 'block';
  const searchBar = document.querySelector('#search-bar');
  searchBar.placeholder = 'Search By User Name';
  searchBar.addEventListener('input', e =>{
    const searchInput = e.target.value.toLowerCase();
    searchData.forEach(data =>{
      const lowerRowData = data.userDetails.map(stf => stf.toLowerCase());
      const isVisible = lowerRowData.some(stf => stf.includes(searchInput));
      data.element.classList.toggle('hide', ! isVisible);
    });
  });

  tableElement.appendChild(tableBody);
  spaceSelect.appendChild(tableElement);
}

async function exportDoc() {
  const spaceSelect = document.querySelector('.book-grid');
  spaceSelect.innerHTML = ''; // clear previous content
  spaceSelect.style.display = 'flex';
  spaceSelect.style.flexDirection = 'column';
  spaceSelect.style.justifyContent= 'center';
  spaceSelect.style.alignItems = 'center';
  spaceSelect.style.padding = '0';

  const upperBar = document.querySelector('.top-bar');
  upperBar.innerHTML= ''; // clear upper buttons

  const searchContainer = document.querySelector('.search-container');
  searchContainer.style.display = 'none'; // hide search bar

  const searchPlaceholder = document.querySelector('.search-div');
  searchPlaceholder.style.height =  '20px'; //ocupy search bar space

  //whole report button
  const exportPdfreport = document.createElement('button')
  exportPdfreport.className = 'export-pdf-btn';
  exportPdfreport.textContent = 'Export entire PDF Report';
  spaceSelect.appendChild(exportPdfreport);
  exportPdfreport.onclick = async function() {
    const hideLayout = document.querySelector('.layout')
    hideLayout.style.display = 'none';
    let reportDestination = await eel.report_path()();
    hideLayout.style.display = 'block';
    await eel.generate_pdf('Whole Report', reportDestination)();
  }

  // book status report button
  const exportPdfStatus = document.createElement('button');
  exportPdfStatus.className = 'export-pdf-btn';
  exportPdfStatus.textContent = 'Export Book Status Report';
  spaceSelect.appendChild(exportPdfStatus);
  exportPdfStatus.onclick = async function() {
    const hideLayout = document.querySelector('.layout')
    hideLayout.style.display = 'none';
    let reportDestination = await eel.report_path()();
    hideLayout.style.display = 'block';
    await eel.generate_pdf('table books status', reportDestination)();
  };

  // borrower report button
  const exportPdfBorrower = document.createElement('button');
  exportPdfBorrower.className = 'export-pdf-btn';
  exportPdfBorrower.textContent = 'Export Borrower Report';
  spaceSelect.appendChild(exportPdfBorrower);
  exportPdfBorrower.onclick = async function() {
    const hideLayout = document.querySelector('.layout')
    hideLayout.style.display = 'none';
    let reportDestination = await eel.report_path()();
    hideLayout.style.display = 'block';
    await eel.generate_pdf('table borrowers', reportDestination)();
  };

};