# Variables for relative path, image path and post path.
top_src_dir='../../'
image_file=$top_src_dir$1
post=$top_src_dir'_posts/'$2

# Extract EXIF.
lens=$(exiftool -lens $image_file | awk '{print ""}{for(i=3;i<=NF;++i)printf $i" "}')
iso=$(exiftool -iso $image_file | awk '{print $3}')

echo '' >> $post
echo 'lens:'$lens >> $post
echo 'iso: '$iso >> $post  # Need the extra space.

echo '---' >> $post