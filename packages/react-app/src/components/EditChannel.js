import React, {useEffect, useRef, useState} from 'react';
import { useClick, useClickAway } from 'react-use';
import styled ,  {useTheme} from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { addresses, abis } from "@project/contracts";
import Loader from 'react-loader-spinner';

import {Item, H2, H3, Span, Button, Input, Content} from 'components/SharedStyling';
import Dropzone from "react-dropzone-uploader";
import { Container } from '@material-ui/core';

const ethers = require('ethers');


export default function EditChannelModal({
    onClose,onSuccess, channelDetails
}) {

    const themes = useTheme();
    console.log(themes);
    const modalRef = useRef(null);
    const [mainAdress, setMainAddress] = useState('');
    const [image, setImage] = useState(null);
    const [imageErr, setImageErr] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState('');
    const [channelName,setChannelName]=useState('');
    const [channelInfo,setChannelInfo]=useState('');
    const [channelCTA,setChannelCTA]=useState('');

    useEffect(()=>{
        console.log("channelDetails",channelDetails);
        setChannelCTA(channelDetails.url);
        setChannelName(channelDetails.name);
        setChannelInfo(channelDetails.info);
    },[])

    // Form signer and contract connection
    useClickAway(modalRef, onClose);

    const addDelegateFunction = () => {
        setLoading('loading')
        .then(async (tx) => {
            console.log(tx);
            setLoading("Transaction Sent!");

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);

        })
        .catch((err) => {
            console.log({
                err
            })
            setLoading('There was an error');
            setTimeout(() => {
                setLoading('')
            }, 2000)
        })
    };

    const handleDragOver = (e) => {
        e.preventDefault();
      };

      const handleOnDrop = (e) => {
        //prevent the browser from opening the image
        e.preventDefault();
        e.stopPropagation();
        //let's grab the image file
        let imageFile = e.dataTransfer.files[0];
        handleFile(imageFile);
      };

      const handleFile = (file) => {
        //you can carry out any file validations here...
        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = function(e) {
            // console.log(reader.result);
            const response = handleLogoSizeLimitation(reader.result);
            console.log(response)
            if (response.success) {
            setImageErr(null)
            //   setUploadDone(true);
            } else {
            //   setProcessingInfo(response.info);
            setImageErr(response.info)
            }
          };


        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
      };

      const removeImage = (e) => {
        e.preventDefault();
        setPreviewUrl("");
        setImage(null);
        URL.revokeObjectURL(previewUrl);
      };


      const handleLogoSizeLimitation = (base64) => {
        // Setup Error on higher size of 128px
        var sizeOf = require("image-size");
        var base64Data = base64.split(";base64,").pop();
        var img = Buffer.from(base64Data, "base64");
        var dimensions = sizeOf(img);
    
        // Only proceed if image is equal to or less than 128
        if (dimensions.width > 128 || dimensions.height > 128) {
          console.log("Image size check failed... returning");
          return {
            success: 0,
            info: "Image size check failed, Image should be 128X128PX",
          };
        }
    
        // only proceed if png or jpg
        // This is brilliant: https://stackoverflow.com/questions/27886677/javascript-get-extension-from-base64-image
        let fileext;
        console.log(base64Data.charAt(0));
        if (base64Data.charAt(0) == "/") {
          return {
            success: 1,
            info: "Image checks passed",
          };
        } else if (base64Data.charAt(0) == "i") {
          return {
            success: 1,
            info: "Image checks passed",
          };
        } else {
          return {
            success: 0,
            info: "Image extension should be jpg or png",
          };
        }
      };



      

    return (
        <Overlay>
            <AliasModal ref={modalRef} background={themes}>
                <Item align="flex-start">
                    <H2 textTransform="uppercase" spacing="0.1em">
                    <Span weight="200">Edit </Span><Span bg="#674c9f" color="#fff" weight="600" padding="0px 8px">Channel</Span>
                    </H2>
                    <H3>Edit Channel.</H3>
                </Item>
            
            {/* upload image */}
            <Space className="">
              <div>
                <H3 margin="2px 0px" color="#e20880">UPLOAD CHANNEL LOGO. MAKE SURE IMAGE IS 128X128PX</H3>
                <div
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleOnDrop(e)}
                  className="bordered"
                >
                  <div className="inner">
                    <svg
                      className="svg"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-div">
                      <label
                        htmlFor="file-upload"
                        className="labeled relative cursor-pointer bg-white rounded-sm font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          accept="image/*"
                          name="file-upload"
                          hidden
                          onChange={(e) => handleFile(e.target.files[0])}
                          type="file"
                          className="sr-only"
                        />
                      </label>
                      <span className="">- or drag and drop</span>
                    </div>
                    <p className="text-below">
                      PNG, JPG of resolution 128px by 128px
                    </p>
                  </div>
                </div>
              </div>

              {imageErr && <div className='image-error'>{imageErr}</div>}

              {previewUrl && (
                <div className="image">
                  <img
                    src={previewUrl}
                    alt="image"
                    className="item w-32 h-auto rounded-sm mt-2"
                  />
                  <div className='image-border'>
                  <span className='text'> {image.name}</span>
                  </div>
                  
                </div>
              )}
            </Space>


                <Item align="flex-start">
                    <CustomInput
                        required
                        placeholder="Channel Name"
                        radius="4px"
                        padding="12px"
                        border="1px solid #674c9f"
                        bg="#fff"
                        value={channelName}
                        onChange={(e) => {setChannelName(e.target.value)}}
                    />
                </Item>
                <Item align="flex-start">
                    <CustomInput
                        required
                        placeholder="Channel Description"
                        radius="4px"
                        padding="12px"
                        border="1px solid #674c9f"
                        bg="#fff"
                        value={channelInfo}
                        onChange={(e) => {setChannelInfo(e.target.value)}}
                    />
                </Item>
                <Item align="flex-start">
                    <CustomInput
                        required
                        placeholder="Channel CTA"
                        radius="4px"
                        padding="12px"
                        border="1px solid #674c9f"
                        bg="#fff"
                        value={channelCTA}
                        onChange={(e) => {setChannelCTA(e.target.value)}}
                    />
                </Item>
                <Item margin="15px 0px 0px 0px" flex="1" self="stretch" align="stretch">
                    <Button
                        bg='#e20880'
                        color='#fff'
                        flex="1"
                        radius="0px"
                        padding="20px 10px"
                        disabled={mainAdress.length !== 42}
                        onClick={addDelegateFunction}
                    >
                        { loading && <Loader
                            type="Oval"
                            color="#FFF"
                            height={16}
                            width={16}
                            />
                        }
                        <StyledInput
                            cursor="hand"
                            textTransform="uppercase"
                            color="#fff" weight="400"
                            size="0.8em" spacing="0.2em"
                            value={loading ? loading : "Edit"}
                        />
                    </Button>
                </Item>
            </AliasModal>
        </Overlay>
    )
}

const StyledInput = styled(Input)`
    width: 100%;
    text-align: center;
    caret-color: transparent;
`

const Space = styled.div`
    width: 100%;
    margin-top: 12px;
    .bordered {
        display: flex;
        justify-content: center;
        border: 4px dotted #ccc;
        border-radius: 10px;
        padding: 10px;
        .inner {
            margin-top: 0.25rem;
            text-align: center;
            .svg {
                margin: 0px auto;
                height: 3rem;
                width: 3rem;
                color: #ccc;
            }
            .text-div {
                display: flex;
                font-size: 1rem; 
                line-height: 1rem;
                color: #ccc;
                justify-content: center;
                .labeled {
                    position: relative;
                    cursor: pointer;
                    background-color: white;
                    border-radius: 4px;
                    color: #60A5FA;
                }
            }
            .text-below {
                font-size: 1rem; 
                line-height: 1rem;
                color: #ccc;
                margin-top: 1rem;

            }
        }
    }
    .image-error{
        font-size: 1rem; 
        line-height: 1rem;
        color: red;
        margin-top: .5rem;
    }
    .image{
        margin-top: 1rem;
        display: flex;
        flex-direction: row;
        .item{
            width: 4rem;
            height: auto;
            border-radius: 4px;
        }
        .image-border{
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            margin-left: 2rem;
                .text{
                font-size: 1rem; 
                line-height: 1rem;
                color: #ccc;
                margin-top: 1rem;
        }
     }
    }
`

const CustomInput = styled(Input)`
    box-sizing: border-box;
    width: 100%;
    margin: 20px 0px;
`;

const Overlay = styled.div`
    top: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.85);
    height: 100%;
    width: 100%;
    z-index: 1000;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-y: scroll;
`;

const AliasModal = styled.div`
    padding: 20px 30px;
    background: ${props => props.background.mainBg};
`;