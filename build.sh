node --experimental-sea-config sea-config.json
cp $(command -v node) build/amdhelper
codesign --remove-signature build/amdhelper
chmod 755 build/amdhelper
bunx postject build/amdhelper NODE_SEA_BLOB build/sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA
codesign --sign - build/amdhelper