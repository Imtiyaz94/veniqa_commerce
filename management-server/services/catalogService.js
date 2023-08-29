import config from 'config';
import Product from '../database/models/product';
import cryptoGen from '../authentication/cryptoGen';
import awsConnections from '../cloudservices/awsConnections';
import httpStatus from 'http-status-codes';
import axios from 'axios';
import logger from '../logging/logger';
import mongoose from 'mongoose';

export default {
    async searchCatalog(pagingOptions, searchTerm, sortRule) {
        let result = {};
        let searchObj = searchTerm ? { $text: { $search: searchTerm } } : {};
        try {
            let products = await Product.paginate(searchObj, {
                select: '_id name brand store marked_price price thumbnailUrls active',
                populate: [
                    { path: 'category', select: '-_id category subcategory' }
                ],
                sort: sortRule,
                page: pagingOptions.page,
                limit: pagingOptions.limit
            }).then(result => {
                return result;
            }).catch(err => {
                return err;
            });
            result = { httpStatus: httpStatus.OK, status: "successful", responseData: products };
            return result;
        }
        catch (err) {
            logger.error("Error in searchCatalog Service", { meta: err });
            result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: err };
            return result;
        }
    },

    async addProductToCatalog(productObj, userObj) {
        let result = {};
        try {
            let product = new Product(productObj);
            product.auditLog = {
                createdBy: { email: userObj.email, name: userObj.name },
                updatedBy: { email: userObj.email, name: userObj.name },
                createdOn: new Date(),
                updatedOn: new Date()
            };
            product = await product.save();

            if (!product) {
                result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: httpStatus.getStatusText(httpStatus.BAD_REQUEST) };
                return result;
            }

            // Upload the brand new permanent thumbnail that will be preserved forever, throws error if unsuccessful
            // console.log("product url", product.thumbnailUrls[0]);
            // console.log("product url", product._id);

            await this.uploadPermanentProductThumbnail(product._id, product.thumbnailUrls[0]);

            result = { httpStatus: httpStatus.OK, status: "successful", responseData: product };
            return result;
        }
        catch (err) {
            logger.error("Error in addProductToCatalog Service", { meta: err });
            result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: err };
            return result;
        }
    },

    async getProductDetails(productId) {
        let result = {};
        console.log("get product", productId);
        try {
            let product = await Product.findOne({ _id: productId }).populate('category tariff').exec();
            result = product ? { httpStatus: httpStatus.OK, status: "successful", responseData: product } : { httpStatus: httpStatus.NOT_FOUND, status: "failed", errorDetails: httpStatus.getStatusText(httpStatus.NOT_FOUND) };
            return result;
        }
        catch (err) {
            logger.error("Error in getProductDetails Service", { meta: err });
            result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: err };
            return result;
        }
    },
    async getAllProductsDetails() {
        let result = {};
        // console.log("get product", productId);
        try {
            let products = await Product.find().select('-weight -tariff -customizationOptions -custom_attributes -auditLog -details_html -store_sku -active  ').exec();
            // console.log("all products", products);
            result = products ? { httpStatus: httpStatus.OK, status: "successful", responseData: products } : { httpStatus: httpStatus.NOT_FOUND, status: "failed", errorDetails: httpStatus.getStatusText(httpStatus.NOT_FOUND) };
            return result;
        }
        catch (err) {
            logger.error("Error in getAllProductsDetails Service", { meta: err });
            result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: err };
            return result;
        }
    },

    async updateProductInCatalog(productObj, userObj) {
        let result = {};
        try {
            // Store the id and delete it from the received object, to prevent any accidental replacement of id field
            let id = productObj._id;
            if (!id) {
                result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: "Missing Product ID" };
                return result;
            }
            delete productObj._id;
            // console.log("delete", delete productObj._id;)
            // Change audit related info
            // let ids = await Product.findOne({ _id: id });
            // console.log("tempproduct", ids);

            // let tempProduct = await Product.findOne({ _id: id }, '-_id detailedImageUrls thumbnailUrls featuredImageUrls auditLog').exec();
            let tempProduct = await Product.findOne({ _id: id })
                .select('-_id detailedImageUrls thumbnailUrls featuredImageUrls auditLog').exec();

            // console.log("auditlog", tempProduct);
            tempProduct.auditLog.updatedBy = { email: userObj.email, name: userObj.name };
            tempProduct.auditLog.updatedOn = new Date();
            productObj.auditLog = tempProduct.auditLog;

            // Prepare a list of old images to delete in s3 (don't delete them until product update successful)
            let s3ObjectsToDelete = [];
            if (tempProduct && tempProduct.detailedImageUrls && tempProduct.detailedImageUrls.length > 0) {
                let folderName = tempProduct.detailedImageUrls[0].split('/')[4];    // That's the index in the url where the folder name for a catalog will be

                for (let url of tempProduct.detailedImageUrls) {
                    s3ObjectsToDelete.push({ Key: folderName + "/detailed-images/" + url.split('/')[6] });
                }

                for (let url of tempProduct.thumbnailUrls) {
                    s3ObjectsToDelete.push({ Key: folderName + '/thumbnails/' + url.split('/')[6] });
                }

                for (let url of tempProduct.featuredImageUrls) {
                    s3ObjectsToDelete.push({ Key: folderName + "/featured-images/" + url.split('/')[6] });
                }
            }

            // Make the update and return the updated document. Also run validators. Mongoose warns only limited validation takes place doing this in update

            // Set the useFindAndModify option to false
            // mongoose.set('useFindAndModify', false);

            // let product = await Product.findOneAndUpdate({ _id: id }, productObj, { runValidators: true, new: true, includeResultMetadata: true }).populate('category tariff').exec();

            // console.log("Fetching product with ID:", id);

            let product = await Product.findOneAndUpdate(
                { _id: id },                    // Query condition
                productObj,                     // Update data
                {                               // Options
                    runValidators: true,
                    new: true,
                    includeResultMetadata: true
                }
            ).populate('category tariff').exec();

            // console.log("Product fetched and updated:", product);

            // console.log("update product", product);

            if (!product) {
                result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: httpStatus.getStatusText(httpStatus.BAD_REQUEST) };
                return result;
            }

            // Go ahead and delete the old s3 objects if the update was successful
            if (s3ObjectsToDelete.length > 0) {
                // Delete the old s3 objects for this product now
                awsConnections.s3.deleteObjects({
                    Bucket: config.get('aws_settings.s3.buckets.catalog_image_bucket'),
                    Delete: {
                        Objects: s3ObjectsToDelete,
                        Quiet: false
                    }
                }, (err, data) => {
                    if (err) {
                        // Handle error if needed
                        console.error("Error deleting objects from S3:", err);
                    } else {
                        console.log("Deleted objects from S3:", data);
                    }
                });

            }

            // Upload the brand new permanent thumbnail that will be preserved forever, throws error if unsuccessful

            // console.log("update product url", product.thumbnailUrls[0]);
            await this.uploadPermanentProductThumbnail(product._id, product.thumbnailUrls[0]);

            result = { httpStatus: httpStatus.OK, status: "successful", responseData: product };

            return result;
        }
        catch (err) {
            logger.error("Error in updateProductInCatalog Service", { meta: err });
            result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: err };
            return result;
        }
    },

    async deleteProductFromCatalog(productId) {
        let result = {};
        try {
            // Remove the product
            let product = await Product.findOne({ _id: productId }).exec();
            let res = await Product.deleteOne({ _id: productId }).exec();

            // if removal not successful, return failure
            if (!res) {
                result = { httpStatus: httpStatus.INTERNAL_SERVER_ERROR, status: "failed", errorDetails: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR) };
                return result;
            }

            // If product removal was succesful, go ahead and clear the storage occupied by the product in s3
            // Prepare a list of images to delete in s3
            let s3ObjectsToDelete = [];
            if (product && product.detailedImageUrls && product.detailedImageUrls.length > 0) {
                let folderName = product.detailedImageUrls[0].split('/')[4];    // That's the index in the url where the folder name for a catalog will be

                for (let url of product.detailedImageUrls) {
                    s3ObjectsToDelete.push({ Key: folderName + "/detailed-images/" + url.split('/')[6] });
                }

                for (let url of product.thumbnailUrls) {
                    s3ObjectsToDelete.push({ Key: folderName + '/thumbnails/' + url.split('/')[6] });
                }

                for (let url of product.featuredImageUrls) {
                    s3ObjectsToDelete.push({ Key: folderName + "/featured-images/" + url.split('/')[6] });
                }
            }

            // Go ahead and delete the old s3 objects
            if (s3ObjectsToDelete.length > 0) {
                // Delete the s3 objects for this product now
                awsConnections.s3.deleteObjects({
                    Bucket: config.get('aws_settings.s3.buckets.catalog_image_bucket'),
                    Delete: {
                        Objects: s3ObjectsToDelete,
                        Quiet: false
                    }
                }, (err, data) => {
                    if (err) {
                        logger.error("Error in deleting image ", { meta: err });
                    }
                    else {
                        return data;
                    }
                });
            }

            result = { httpStatus: httpStatus.OK, status: "successful", responseData: res };
            return result;
        }
        catch (err) {
            logger.error("Error in deleteProductFromCatalog Service", { meta: err });
            result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: err };
            return result;
        }
    },

    async getPresignedUrlsForCatalogImageUploads(productId, numberOfThumbnailAndDetailedImages, numberOfFeaturedImages) {
        let result = {};
        try {
            // Limit the max number of images the urls can be requested for at once.

            if (numberOfThumbnailAndDetailedImages > 7 || numberOfFeaturedImages > 7) {
                result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: "Maximum number of allowed images for each type is 7" };
                return result;
            }

            let folderName, product;
            // If a productId was passed and the product is found, use its existing image urls to find corresponding s3 folder, otherwise generate a new folder name
            if (productId) {
                product = await Product.findOne({ _id: productId }).exec();
                // console.log("product in presignedUrl", product);
                if (product && product.detailedImageUrls && product.detailedImageUrls.length > 0) {
                    // Extracting the folder name
                    let extractionUrl = product.detailedImageUrls[0];
                    folderName = extractionUrl.split('/')[4]; // That's the index in the url where the folder name for a catalog will be
                }
                else {
                    folderName = await cryptoGen.generateRandomToken();
                }
            }
            else {
                // Generate a random folder name to put contents
                folderName = await cryptoGen.generateRandomToken();
            }

            // Prepare the object which will contain the urls
            let response = {
                thumbnailUrls: [],
                detailedImageUrls: [],
                featuredImageUrls: []
            };

            // Generate the thumbnail and detailed image urls to push to the response object
            for (let index = 0; index < numberOfThumbnailAndDetailedImages; index++) {
                // Generate a new file even if there are previous ones (because they will be deleted upon updateProduct api call)
                // We couldn't replace existing files because if those images were cached in some user's system, the updated image wouldn't show up
                let filename = await cryptoGen.generateRandomToken();

                // GENERATE LINKS FOR THE THUMBNAIL FIRST
                let thumbnailObjectKey = folderName + "/thumbnails/" + filename;

                // console.log("thumbObjectKey", thumbnailObjectKey);

                // let thumbnailLiveUrl = config.get('aws_settings.s3.s3_resource_live_base_url') + "/" + config.get('aws_settings.s3.buckets.catalog_image_bucket') + "/" + thumbnailObjectKey;

                // let thumbnailLiveUrl = process.env.VENIQA_AWS_S3_LIVE_URL + "/" + process.env.VENIQA_AWS_BUCKET + "/" + thumbnailObjectKey;
                const bucket = process.env.VENIQA_AWS_BUCKET;
                const region = process.env.VENIQA_AWS_REGION;
                let thumbnailLiveUrl = `https://${bucket}.s3.${region}.amazonaws.com/${thumbnailObjectKey}`;

                const params1 = {
                    Bucket: process.env.VENIQA_AWS_BUCKET,
                    Expires: process.env.VENIQA_AWS_EXPIRES_IN,
                    Key: thumbnailObjectKey,
                    ContentType: 'image/jpeg', // Set the content type
                    // ACL: 'public-read',
                    // ContentType: 'application/octet-stream', // Set the content type
                    // ContentType: 'application/x-www-form-urlencoded; charset=UTF-8',

                };
                let thumbnailUploadUrl = awsConnections.s3.getSignedUrl('putObject', params1);

                response.thumbnailUrls.push({
                    uploadUrl: thumbnailUploadUrl,
                    liveUrl: thumbnailLiveUrl
                });


                // GENERATE LINKS FOR THE DETAILED IMAGES NEXT
                let detailedImageObjectKey = folderName + "/detailed-images/" + filename;
                // let detailedImageLiveUrl = config.get('aws_settings.s3.s3_resource_live_base_url') + "/" + config.get('aws_settings.s3.buckets.catalog_image_bucket') + "/" + detailedImageObjectKey;

                // let detailedImageLiveUrl = process.env.VENIQA_AWS_S3_LIVE_URL + "/" + process.env.VENIQA_AWS_BUCKET + "/" + detailedImageObjectKey;

                // let detailedImageLiveUrl = "https://veniqaaws.s3.ap-south-1.amazonaws.com" + "/" + detailedImageObjectKey;

                let detailedImageLiveUrl = `https://${bucket}.s3.${region}.amazonaws.com/${detailedImageObjectKey}`;

                const params = {
                    // Bucket: config.get('aws_settings.s3.buckets.catalog_image_bucket'),
                    // Expires: config.get('aws_settings.s3.presigned_url_expires_in'), // URL expiration time in seconds
                    Bucket: process.env.VENIQA_AWS_BUCKET,
                    Expires: process.env.VENIQA_AWS_EXPIRES_IN,
                    Key: detailedImageObjectKey,
                    ContentType: 'image/jpeg', // Set the content type
                    // ACL: 'public-read',
                    // ContentType: 'application/octet-stream', // Set the content type
                    // ContentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                };
                let detailedImageUploadUrl = awsConnections.s3.getSignedUrl('putObject', params);

                response.detailedImageUrls.push({
                    uploadUrl: detailedImageUploadUrl,
                    liveUrl: detailedImageLiveUrl
                });
            };

            // Generate the featured image urls and push it to the response object
            for (let index = 0; index < numberOfFeaturedImages; index++) {
                // Generate a new file even if there are previous ones (because they will be deleted upon updateProduct api call)
                // We couldn't replace existing files because if those images were cached in some user's system, the updated image wouldn't show up
                let filename = await cryptoGen.generateRandomToken();
                let objectKey = folderName + "/featured-images/" + filename;
                // let objectLiveUrl = config.get('aws_settings.s3.s3_resource_live_base_url') + "/" + config.get('aws_settings.s3.buckets.catalog_image_bucket') + "/" + objectKey;

                // let objectLiveUrl = process.env.VENIQA_AWS_S3_LIVE_URL + "/" + process.env.VENIQA_AWS_BUCKET + "/" + objectKey;
                const bucket = process.env.VENIQA_AWS_BUCKET;
                const region = process.env.VENIQA_AWS_REGION;
                let objectLiveUrl = `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;

                const params = {
                    // Bucket: config.get('aws_settings.s3.buckets.catalog_image_bucket'),
                    // Expires: config.get('aws_settings.s3.presigned_url_expires_in'),
                    Bucket: process.env.VENIQA_AWS_BUCKET,
                    Expires: process.env.VENIQA_AWS_EXPIRES_IN,
                    Key: objectKey,
                    ContentType: 'image/jpeg', // Set the content type
                    // ACL: 'public-read',
                    // ContentType: 'application/octet-stream', // Set the content type
                    // ContentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                };
                let presignedUploadUrl = awsConnections.s3.getSignedUrl('putObject', params);


                response.featuredImageUrls.push({
                    uploadUrl: presignedUploadUrl,
                    liveUrl: objectLiveUrl
                });
            }

            // Returm all the generated urls
            console.log('presigned urls', response);
            result = { httpStatus: httpStatus.OK, status: "successful", responseData: response };
            return result;
        }
        catch (err) {
            logger.error("Error in getPresignedUrlsForCatalogImageUploads Service", { meta: err });
            result = { httpStatus: httpStatus.BAD_REQUEST, status: "failed", errorDetails: err };
            return result;
        }
    },


    async uploadPermanentProductThumbnail(productId, imageUrl) {
        try {

            // Fetch the image using axios
            let response = await axios.get(imageUrl, { responseType: 'arraybuffer' }).then((res) => {
                console.log('res', res.data.data);
                return res.data.data;
            }).catch((err) => {
                console.log('err in axios call', err.config);
            });

            console.log('fetched image response', response);

            // Upload the fetched image to AWS S3
            const s3Key = 'permanent-thumbnails/' + productId;
            const uploadParams = {
                // Bucket: config.get('aws_settings.s3.buckets.catalog_image_bucket'),
                Bucket: process.env.VENIQA_AWS_BUCKET,
                Key: s3Key,
                Body: response,
                ContentType: 'image/jpeg', // Set the appropriate content type
                // ACL: 'public-read',
            };
            const s3UploadResponse = await awsConnections.s3.getSignedUrl('putObject', uploadParams);

            // console.log("S3 upload response", s3UploadResponse);

            return s3UploadResponse; // Return the S3 upload response
        } catch (err) {
            console.error("Error while uploading permanent thumbnail to S3");
            throw { message: "Error while uploading permanent thumbnail to S3", error: err };
        }
    }
};