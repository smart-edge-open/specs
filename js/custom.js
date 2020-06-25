/* SPDX-License-Identifier: Apache-2.0
 * Copyright (c) 2020 Intel Corporation
 */

jQuery(document).ready(function(){
    
    var url = jQuery(location).attr('href').split("/").reverse()[2];
    if(typeof url != 'undefined' && url != ''){
        jQuery('li.'+url).parent('ul.parent').siblings('i').addClass('fa-angle-down').removeClass('fa-angle-right');
        jQuery('li.'+url).css('display','block');
        jQuery('li.'+url).parent('ul.parent').addClass('visible');
        //jQuery('.collaspeContent ul:not(.parent)').children('li').css('display','block');
    }
    
    
    jQuery('.collaspeContent li').each(function(){
        if(jQuery(this).find('ul').length <= 0){
                jQuery(this).find('i').hide();
        }
    });
    
    jQuery('.collaspeHead').on('click', function(){
        if(jQuery(this).next('.collaspeContent').is(':visible')){
                jQuery(this).next('.collaspeContent').slideUp();
        }
        else{
            jQuery(this).children('ul').removeAttr('style');
                jQuery('.collaspeContent').slideUp();
                jQuery(this).next('.collaspeContent').slideDown();
        }
    });
    
    jQuery('.quickLinkBtn').on('click', function(){
            jQuery('.collapseArea').slideToggle();
    });
    jQuery('.nav-mobile').on('click', function(){
            jQuery('.opennessmenu').slideToggle();
    });
        
        
    jQuery('.collaspeContent ul li a').click('on',function(e){        
        if(jQuery(this).parent('li').hasClass('with-section')){ 
            if(jQuery(this).parent('li').children('ul').hasClass('visible')){
                jQuery(this).siblings('ul').removeClass('visible');
                jQuery(this).siblings('i').removeClass('fa-angle-down').addClass('fa-angle-right');
                jQuery(this).siblings('ul').find('li').slideUp();
            }else{
                jQuery(this).siblings('ul').addClass('visible');
                jQuery(this).siblings('i').removeClass('fa-angle-right').addClass('fa-angle-down');
                jQuery(this).siblings('ul').find('li').slideDown();
            } 
            return false;
        }
        
        /*if(jQuery(this).children('a:first').attr('href') == 'javascript:void(0)'){ alert('3');
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
        }else{ alert('4');
           // document.location.href=jQuery(this).children('a').attr('href');
           return false;
        }*/
    });
    

    
});
if(jQuery(window).width() <= 768 ){
	jQuery(window).on("resize load",function(){
		if (jQuery(window).width() <= 768 ){			
			jQuery('.social-down').remove();
			jQuery('.parent').append('<i class="social-down"><i class="fa fa-angle-down"></i></i>');
			jQuery('.social-down').click(function(){	
				if(jQuery(this).parent().find(".nav-child").is(':visible')){
					jQuery('.social-down').prev('.nav-child').slideUp();
				}
				else{
					jQuery('.social-down').prev('.nav-child').slideUp();
					jQuery(this).parent().find(".nav-child").slideDown(500);
				}
			});			
		}
	});
};