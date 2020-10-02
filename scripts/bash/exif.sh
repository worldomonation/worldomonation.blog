# Variables for relative path, image path and post path.
top_src_dir='../../'
if [[ $1 == *"../../"* ]]; then
    image_file=$1
else
    image_file=$top_src_dir$1
fi
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
lens="$(exiftool -lens $image_file | awk '{print ""}{for(i=3;i<=NF;++i)printf $i" "}')"
iso="$(exiftool -iso $image_file | awk '{print $3}')"
make="$(exiftool -make $image_file | awk '{print $3}')"
model="$(exiftool -model $image_file | awk '{print ""}{for(i=5;i<=NF;++i)printf $i" "}')"
capture_date="$(exiftool "-modifydate" $image_file | awk '{print $4}' | awk '{gsub(/:/,"-");print;}')"

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

echo "" >> $post;  sed -ie '/^$/d;$G' $post; sed -ie '/^$/d;$G' $post

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

echo '---' >> $post