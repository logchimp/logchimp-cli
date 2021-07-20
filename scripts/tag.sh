#! /bin/bash

####
# Create new tag with message
#
# @params string tag_name
# sh ./scripts/tag.sh v10.423.023
#####

NEW_TAG=$1

RECENT_TAG=$(git describe --abbrev=0)

git tag -a $NEW_TAG -m "https://github.com/logchimp/logchimp-cli/compare/$RECENT_TAG...$NEW_TAG"

read -p "Do you want to push the tag to remote? [Y/n] " pushTag

if [ $pushTag = 'y' ]; then
	git push --tag
	echo "Tag succesfully push to remote."
else
	echo "Okay! Tag created successfully."
fi
