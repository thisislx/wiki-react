import React, { useContext, useEffect, useState, useRef } from 'react';
import type { DraggerProps } from 'antd/lib/upload/Dragger';
import type { UploadFile } from 'antd/lib/upload/interface';
import { Upload, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Wc from 'winchi'
import { WcFormContext } from '..'
import { FormComponentProps } from '../../d'
import styles from './index.less';

const { Dragger } = Upload;

export type WcFileType = 'image' | 'video' | 'audio' | 'text'

export interface WcUploadProps extends Omit<DraggerProps, 'onChange'>, FormComponentProps {
  fileType?: WcFileType[]
}

const MyUpload_: React.FC<WcUploadProps> = ({
  className = '',
  onChange,
  value,
  fileType = Wc.arr,
  accept: accept_ = '',
  beforeUpload: beforeUpload_ = () => true,
  ...props
}) => {
  const { toggleLoading } = useContext(WcFormContext)
  const [fileList, setFileList] = useState<UploadFile[]>(Wc.arr)
  const [imgUrl, setImgUrl] = useState<string>()
  const isSelfChangeRef = useRef<boolean>(false)
  const accept = `${accept_} ${fileType.reduce((r, key) => `${r}${_mapAccept[key] ? `,${_mapAccept[key]}` : ''}`, '')}`

  useEffect(() => {
    isSelfChangeRef.current || setFileList(Array.isArray(value) ? value : Wc.arr)
    isSelfChangeRef.current = false
  }, [value])

  useEffect(() => {
    const loadingFile = fileList?.find(d => d.status === 'uploading')
    toggleLoading?.(!!loadingFile)
  }, [fileList])

  // handle
  const changeHandle: DraggerProps['onChange'] = ({ file, fileList }) => {
    if (!file.status) return
    if (file.status === 'done') {
      isSelfChangeRef.current = true
      onChange?.(
        fileList
          .map((item) => item.response)
          .filter(d => d)
      )
    }

    setFileList(fileList.filter(d => beforeUpload(d.originFileObj, fileList)))
  };

  const beforeUpload = (file, list) => {
    const fileTypeCheck = fileType.find(key => _checkFile[key]?.(file) === false)
    return fileTypeCheck ? false : beforeUpload_?.(file, list)
  }

  const previewHandle = (file: UploadFile) => {
    if (_checkFile.image(file)) {
      setImgUrl(file.url ?? file.thumbUrl)
    }
  }

  return (
    <>
      <Dragger
        name="file"
        listType="picture"
        showUploadList
        onPreview={previewHandle}
        className={`${styles.dragger} ${className}`}
        onChange={changeHandle}
        accept={accept}
        beforeUpload={beforeUpload}
        {...props}
        fileList={fileList}
      >
        <InboxOutlined className={styles.icon} />
      </Dragger>

      <Image
        placeholder={null}
        preview={{
          visible: !!imgUrl,
          src: imgUrl,
          onVisibleChange(boolean) {
            boolean || setImgUrl(undefined)
          }
        }}
      />
    </>

  );
};

export const WcUpload = React.memo<React.FC<WcUploadProps>>(MyUpload_);

export default WcUpload

const _mapAccept: Record<WcFileType, string> = {
  image: 'image/*',
  video: 'video/*',
  audio: 'image/*',
  text: 'text/*',
}

const _checkFile: Record<WcFileType, AF<[UploadFile], boolean>> = {
  image(file) {
    return file.type?.includes('image') ?? false
  },
  video(file) {
    return file.type?.includes('video') ?? false
  },
  audio(file) {
    return file.type?.includes('audio') ?? false
  },
  text(file) {
    return file.type?.includes('text') ?? false
  },
}


