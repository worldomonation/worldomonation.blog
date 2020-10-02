# Variables for relative path, image path and post path.
top_src_dir='../../'
image_file=$top_src_dir$1
post=$top_src_dir'_posts/'$2

if [ -z $image_file ]; then
    echo image file not found at $image_file
    break
fi

if [ -z $post ]; then
    echo post not found at $post
    break
fi 

# Extract EXIF.
lens=$(exiftool -lens $image_file | awk '{print ""}{for(i=3;i<=NF;++i)printf $i" "}')
iso=$(exiftool -iso $image_file | awk '{print $3}')
make=$(exiftool -make $image_file | awk '{print $3}')
model=$(exiftool -model $image_file | awk '{print ""}{for(i=5;i<=NF;++i)printf $i" "}')
capture_date=$(exiftool "-modifydate" $image_file | awk '{print $4}' | awk '{gsub(/:/,"-");print;}')

echo '' >> $post
echo 'lens:'$lens >> $post
echo 'iso: '$iso >> $post  # Need the extra space.
echo 'make: '$make >> $post
echo 'model:'$model >> $post
echo 'capture_date: '$capture_date >> $post


echo '---' >> $post