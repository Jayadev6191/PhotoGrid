var PhotoGrid = (function(){
   var selected_image_id,
       banner_image,
       grid_size; // total number of images


   function injectImages(URLs) {
     var image_list = this.image_list;
     URLs.map(function(URL,index) {
         var img = new Image();
         img.src = URL;
         img.id = index;
         img.className = 'photos';
         image_list.push(img);
         this.mount_point.appendChild(img);
         return img;
     });

     grid_size = URLs.length-1;
     this.addListeners();
   }

   function navigate(obj){
     var src;
     if(obj.type=='left' && obj.current>=0){
        src = this.imageURL[obj.current];
     }
     if(obj.type=='right' && obj.current<= grid_size){
        src = this.imageURL[obj.current];
     }

     big_image.src=src;
   }

   function addListeners(){
     document.querySelectorAll('.photos').forEach(function(img){
       img.onclick = function(event){
         PhotoGrid.lightBoxInit(event.target.id)
       }
     });
   }

   function init(flikr_data){
     var image_url = this.imageURL;
     flikr_data.map(function(data){
        var url = 'https://farm'+data.farm+'.staticflickr.com/'+data.server+'/'+data.id+'_'+data.secret+'.jpg';
        image_url.push(url);
     });
     this.injectImages(image_url);
   }

   function lightBoxInit(id){

     // black pale
     var highlighter = document.createElement('div');
     highlighter.id = 'highlighter';
     document.body.appendChild(highlighter);

     var mount_container = document.createElement('div');
     mount_container.id = 'mount_container';
     document.body.appendChild(mount_container);

     var mounted_image = document.createElement('div');
     mounted_image.id = 'mounted_image';
     mounted_image.class = 'mounted_big_image';
     mount_container.appendChild(mounted_image);

     selected_image_id = parseInt(id);

     var navigation={}; // Setting an object for navigation

     var left_arrow = document.createElement('span');
     left_arrow.id = 'left_arrow';

     left_arrow.addEventListener("click",function(){
       if(selected_image_id>0){
         selected_image_id = parseInt(selected_image_id)-1;
       }
       navigation.current = selected_image_id;
       navigation.type = 'left';

       if(selected_image_id >=0){
        this.navigate(navigation);
      }
     }.bind(this));

     var right_arrow = document.createElement('span');
     right_arrow.id = 'right_arrow';

     right_arrow.addEventListener("click",function(){
       if(selected_image_id<grid_size){
         selected_image_id = parseInt(selected_image_id)+1;
       }
       navigation.current = selected_image_id;
       navigation.type = 'right';

       if(selected_image_id <= grid_size){
        this.navigate(navigation);
      }
     }.bind(this));

     banner_image = this.image_list[selected_image_id].cloneNode(true);
     banner_image.id="big_image";

     mounted_image.appendChild(left_arrow);
     mounted_image.appendChild(banner_image);
     mounted_image.appendChild(right_arrow);
   }


   function lightBoxRemove(id){
     var highlighter_element = document.body.querySelector('#highlighter');
     highlighter_element.parentNode.removeChild(highlighter_element);

     var mount_container_element = document.body.querySelector('#mount_container');
     mount_container_element.parentNode.removeChild(mount_container_element);
   }

   function close(event){
     if(event.keyCode==27) {
       this.lightBoxRemove();
     }else{
       return;
     }
   }

   return {
    image_list:[],
    mount_point:document.querySelector('#mount_point'),
    imageURL:[],
    doAjaxStuff:function(callback){
      var url = "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=71cc66b1e5c083fb75a9d7b4f6c795aa&per_page=10&format=json&nojsoncallback=1";
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
    },
    injectImages : injectImages,
    navigate:navigate,
    addListeners: addListeners,
    init:init,
    lightBoxInit:lightBoxInit,
    lightBoxRemove:lightBoxRemove,
    close:close
  };

})();

PhotoGrid.doAjaxStuff(function(data){
  PhotoGrid.init(data);

  document.addEventListener("keydown", function(e){
      PhotoGrid.close(e);
  }.bind(this),false);
});
