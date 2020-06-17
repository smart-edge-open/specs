# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2020 Intel Corporation

module Jekyll
   module Drops
     class BreadcrumbItem < Liquid::Drop
       extend Forwardable
 
       def initialize(side)
         @side = side
       end
 
       def position
         @side[:position]
       end
 
       def title
         @side[:title]
       end
 
       def url
         @side[:url]
       end
     end
   end
 end
 