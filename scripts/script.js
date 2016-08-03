var PhotoGrid = (function(){
   var selected_image_id,// currently selected image
       banner_image,// lightbox view image
       grid_size; // total number of images

   //triggers when esc key is pressed
   function close(event){
     if(event.keyCode==27) {
       this.lightBoxRemove();
     }else{
       return;
     }
   }

   //removes lightbox view
   function lightBoxRemove(id){
     var highlighter_element = document.body.querySelector('#highlighter');
     highlighter_element.parentNode.removeChild(highlighter_element);

     var mount_container_element = document.body.querySelector('#mount_container');
     mount_container_element.parentNode.removeChild(mount_container_element);
   }

   // validates title for each image
   function titleValidator(title){
     var max_length = 250;
     if(title.length > max_length){
       return title.substring(0, max_length)+'...';
     }else{
       return title;
     }
   }

   // updates lightbox
   function updateLightBox(image){
     banner_image.src=image.url;
     var title = document.querySelector('#title_placeholder');
     title.innerHTML = this.titleValidator(image.title);
   }

   // controller to update lightbox
   function navigate(obj){
     var image;
     if(obj.type=='left' && obj.current>=0){
        image = this.images[obj.current];
     }
     if(obj.type=='right' && obj.current<= grid_size){
        image = this.images[obj.current];
     }
     this.updateLightBox(image);
   }

   // Triggers an action to render preceding images
   function leftArrowClick(){
       if(selected_image_id>0){
         selected_image_id = parseInt(selected_image_id)-1;
       }
       this.navigation.current = selected_image_id;
       this.navigation.type = 'left';

       if(selected_image_id >=0){
        this.navigate(this.navigation);
      }
   }

   // Triggers an action to render postceding images
   function rightArrowClick(){
     if(selected_image_id<grid_size){
       selected_image_id = parseInt(selected_image_id)+1;
     }
     this.navigation.current = selected_image_id;
     this.navigation.type = 'right';

     if(selected_image_id <= grid_size){
      this.navigate(this.navigation);
    }
   }

   // Attaches arrow icons and image to the lightbox view
   function lightBoxAttach(lightbox_container){
     var left_arrow = document.createElement('span');
     left_arrow.id = 'left_arrow';
     left_arrow.addEventListener("click",leftArrowClick.bind(this),false);

     var right_arrow = document.createElement('span');
     right_arrow.id = 'right_arrow';
     right_arrow.addEventListener("click",rightArrowClick.bind(this),false);

     banner_image = this.image_list[selected_image_id].cloneNode(true);
     banner_image.id="banner_image";

     var image_title_placeholder = document.createElement('div');
     image_title_placeholder.id = 'title_placeholder';
     image_title_placeholder.innerHTML = this.titleValidator(banner_image.getAttribute('title'));

     var close_icon = document.createElement('a');
     close_icon.id = 'close_icon';

     banner_image.appendChild(close_icon);

     lightbox_container.appendChild(left_arrow);
     lightbox_container.appendChild(banner_image);
     lightbox_container.appendChild(right_arrow);
     lightbox_container.appendChild(image_title_placeholder);
   }

   // initializes lighbox and builds the skeleton for lightbox view
   function lightBoxInit(id){
     selected_image_id = parseInt(id);

     // black pale background
     var highlighter = document.createElement('div');
     highlighter.id = 'highlighter';
     document.body.appendChild(highlighter);

     var mount_container = document.createElement('div');
     mount_container.id = 'mount_container';
     document.body.appendChild(mount_container);

     var mounted_image = document.createElement('div');
     mounted_image.id = 'mounted_image';
     mount_container.appendChild(mounted_image);

     var close_icon = document.createElement('a');
     close_icon.id = 'close_icon';
     close_icon.addEventListener("click",lightBoxRemove.bind(this),false);
     mounted_image.appendChild(close_icon);


     this.lightBoxAttach(mounted_image);
   }

   // Adds Event listeners to images in the gallery
   function addListeners(){
     var photo_list = document.querySelectorAll('.photos');

     [].forEach.call(photo_list, function(img) {
        img.onclick = function(event){
             PhotoGrid.lightBoxInit(event.target.id)
        }
     });
   }

   // Forms a grid layout by injecting images into the DOM
   function injectImages(images) {
     var image_list = this.image_list;
     images.map(function(image,index) {
         var img = new Image();
         img.src = image.url;
         img.id = index;
         img.title = image.title;
         img.className = 'photos';
         image_list.push(img);
         this.mount_point.appendChild(img);
         return img;
       });

     grid_size = images.length-1;
     this.addListeners();
  }

    // forms meaningful image url strings from response data provided by flickr
   function buildGallery(flikr_data){
     var images = this.images;

     flikr_data.map(function(data){
        var image = {
          title: data.title,
          url: 'https://farm'+data.farm+'.staticflickr.com/'+data.server+'/'+data.id+'_'+data.secret+'.jpg'
        };

        images.push(image);
     });
     this.injectImages(images);
   }

   // Makes an ajax request to flcikr api
   function pingFlickr(callback){
     var url = "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=71cc66b1e5c083fb75a9d7b4f6c795aa&per_page=15&format=json&nojsoncallback=1";
     var xhr = new XMLHttpRequest();
     xhr.open('GET', url);
     xhr.send(null);

     xhr.onreadystatechange = function () {
       var DONE = 4; // readyState 4 means the request is done.
       var OK = 200; // status 200 is a successful return.
       if (xhr.readyState === DONE) {
           if (xhr.status === OK){
             callback(JSON.parse(xhr.response).photos.photo);
           }
       }
     }
   }

   // initializes Photo Grid
   function init(){
     this.pingFlickr(function(data){
       this.buildGallery(data);
     }.bind(this));
   }

   document.addEventListener("keydown", function(e){
       PhotoGrid.close(e);
   }.bind(this),false);

   return {
    image_list:[],
    mount_point:document.querySelector('#mount_point'),
    images:[],
    navigation:{},
    pingFlickr:pingFlickr,
    titleValidator:titleValidator,
    lightBoxAttach:lightBoxAttach,
    updateLightBox:updateLightBox,
    injectImages : injectImages,
    navigate:navigate,
    addListeners: addListeners,
    buildGallery:buildGallery,
    init:init,
    lightBoxInit:lightBoxInit,
    lightBoxRemove:lightBoxRemove,
    close:close
  };

})();

PhotoGrid.init();
