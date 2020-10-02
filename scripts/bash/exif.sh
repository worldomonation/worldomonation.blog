# Variables for relative path, image path and post path.
top_src_dir='../../'
if [[ $1 == *"../../"* ]]; then
    image_file=$1
else
    image_file=$top_src_dir$1
fi
post=$top_src_dir'_posts/'$2

# If image is not found, don't go any further.
if [ -z $image_file ]; then
    echo image file not found at $image_file
    break
fi

# If post is not found, don't go any further.
if [ -z $post ]; then
    echo post not found at $post
    break
fi 

# Extract EXIF from image file.
lens="$(exiftool -lens $image_file | awk '{print ""}{for(i=3;i<=NF;++i)printf $i" "}')"
iso="$(exiftool -iso $image_file | awk '{print $3}')"
make="$(exiftool -make $image_file | awk '{print $3}')"
model="$(exiftool -model $image_file | awk '{print ""}{for(i=5;i<=NF;++i)printf $i" "}')"
capture_date="$(exiftool "-modifydate" $image_file | awk '{print $4}' | awk '{gsub(/:/,"-");print;}')"

# Declare two new arrays - one to hold the value, one to hold the tag.
declare -a EXIF_VALUES=(
    "$lens"
    "$iso"
    "$make"
    "$model"
    "$capture_date"
)
declare -a EXIF=(
    'lens'
    'iso'
    'make'
    'model'
    'capture_date'
)

# Add a newline to the end of the file.
echo "" >> $post;  sed -ie '/^$/d;$G' $post; sed -ie '/^$/d;$G' $post

# Iterate through each EXIF value, paired against the EXIF tag.
# Check if the value exists in the file. If not, write it.
for ((i = 0; i < ${#EXIF_VALUES[@]}; i++))
do
    attr=$(echo "${EXIF_VALUES[$i]}" | xargs)
    tag="${EXIF[$i]}"
    if grep -qF "$tag" $post; then
        echo Not inserting "$tag": "$attr" as it exists already
    else
        echo -e $tag: "$attr" >> $post
    fi
done

# Markdown post needs line break to make it a proper post.
echo '---' >> $post