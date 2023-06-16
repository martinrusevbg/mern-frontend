import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_URL = 'http://localhost:8080/api/';

class UploadFilesService {
    upload(files,password,onUploadProgress) {
        return new Promise((resolve, reject) => {
            for (const key of Object.keys(files)) {
                let file = files[key];
                let formData = new FormData();
                let name = file.name;
                let reader = new FileReader();
                reader.onload = () => {
                    let key = password;
                    let wordArray = CryptoJS.lib.WordArray.create(reader.result);
                    let encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
                    let fileEnc = new Blob([encrypted]);
                    let encfile = new File([fileEnc], name);
                    formData.append("file", encfile);
                    const user = JSON.parse(localStorage.getItem('user'));
                    return axios.post(API_URL + "upload", formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            'x-access-token': user.accessToken
                        }
                    }).then(response => {
                        resolve(response);
                    }).catch(err => {
                        reject('Could not upload the file!');
                    })
                };
                reader.readAsArrayBuffer(file);
                reader.addEventListener('progress', onUploadProgress);
            }
        })
    }

    getFiles(page, perpage, search) {
        const user = JSON.parse(localStorage.getItem('user'));

        return axios.get(API_URL+"files?page="+page+"&perpage="+perpage+"&search="+search, {
            headers: {
                'x-access-token': user.accessToken
            }
        });
    }

    getFileInfo(id) {
        const user = JSON.parse(localStorage.getItem('user'));

        return axios.get(API_URL+"info?id="+id, {
            headers: {
                'x-access-token': user.accessToken
            }
        });
    }

    deleteFile(name) {
        const user = JSON.parse(localStorage.getItem('user'));
        return axios.delete(API_URL+"file/"+name,{
            headers: {
                'x-access-token': user.accessToken
            }
        });
    }

    shareFile(file, email, phone) {
        return new Promise((resolve, reject) => {
            let data = {
                file: file,
                email: email,
                country_code: '+359',
                phone: phone
            }
            const user = JSON.parse(localStorage.getItem('user'));
            return axios.post(API_URL + "share", data, {
                headers: {
                    "Content-Type": "application/json",
                    'x-access-token': user.accessToken
                }
            }).then(response => {
                if(response)
                    resolve(true);
            }).catch(err => {
                reject('Could not upload the file!');
            })
        })
    }

    convertWordArrayToUint8Array(wordArray) {
        let arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
        let length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
        let uInt8Array = new Uint8Array(length), index=0, word, i;
        for (i=0; i<length; i++) {
            word = arrayOfWords[i];
            uInt8Array[index++] = word >> 24;
            uInt8Array[index++] = (word >> 16) & 0xff;
            uInt8Array[index++] = (word >> 8) & 0xff;
            uInt8Array[index++] = word & 0xff;
        }
        return uInt8Array;
    }

    getFile(name,password) {
        let __self = this;
        const user = JSON.parse(localStorage.getItem('user'));
        return axios({
            url: API_URL+"file/"+name,
            method: 'GET',
            responseType: 'blob',
            headers: {
                'x-access-token': user.accessToken
            }
        }).then(function(response){
            let file = response.data;
            let reader = new FileReader();
            reader.onload = () => {
                let key = password;
                let decrypted = CryptoJS.AES.decrypt(reader.result, key);
                let typedArray = __self.convertWordArrayToUint8Array(decrypted);
                let fileDec = new Blob([typedArray]);
                let a = document.createElement("a");
                let url = window.URL.createObjectURL(fileDec);
                let filename = name;
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
            };
            reader.readAsText(file);
        })
    }
}

export default new UploadFilesService();
