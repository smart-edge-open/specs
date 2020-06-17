# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2020 Intel Corporation

require_relative 'drops/breadcrumb_item.rb'

module Jekyll
  module Breadcrumbs
    @@config = {}
    @@siteAddress = ""
    @@sideAddresses = {}

    def self.clearAddressCache
      @@sideAddresses = {}
    end

    def self.loadAddressCache(site)
      clearAddressCache
      site.documents.each { |page| addAddressItem(page.url, page['crumbtitle'] || page['title'] || '') } # collection files including posts
      site.pages.each { |page| addAddressItem(page.url, page['crumbtitle'] || page['title'] || '') } # pages
      site.posts.docs.each { |page| addAddressItem(page.url, page['crumbtitle'] || page['title'] || '') } # posts
    end

    def self.addAddressItem(url, title)    
      key = createAddressCacheKey(url)
      @@sideAddresses[key] = {:url => url, :title => title}
    end

    def self.findAddressItem(path)
      key = createAddressCacheKey(path)
      @@sideAddresses[key] if key
    end

    def self.createAddressCacheKey(path)
      path.chomp("/").empty? ? "/" : path.chomp("/")              
    end

    def self.buildSideBreadcrumbs(side, payload)
      return if side.url == @@siteAddress && root_hide

      drop = Jekyll::Drops::BreadcrumbItem
      payload["breadcrumbs"] = []
      position = 0

      path = side.url.chomp("/").split(/(?=\/)/)
      -1.upto(path.size - 1) do |int|
         joined_path = int == -1 ? "" : path[0..int].join
         item = findAddressItem(joined_path)
         if item 
            position += 1
            item[:position] = position
            payload["breadcrumbs"] << drop.new(item)
         end
      end
    end

   # Config
   def self.loadConfig(site)
      config = site.config["breadcrumbs"] || {"root" => {"hide" => false, "image" => false}} 
      root = config["root"]
      @@config[:root_hide] = root[:hide] || false
      @@config[:root_image] = root[:image] || false
    end

    def self.root_hide
      @@config[:root_hide]
   end

   def self.root_image
      @@config[:root_image]
   end
  end
end

Jekyll::Hooks.register :site, :pre_render do |site, payload|
   Jekyll::Breadcrumbs::loadConfig(site)
  Jekyll::Breadcrumbs::loadAddressCache(site)
end

Jekyll::Hooks.register [:pages, :documents], :pre_render do |side, payload|
  Jekyll::Breadcrumbs::buildSideBreadcrumbs(side, payload)
end
