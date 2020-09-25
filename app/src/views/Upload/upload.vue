<template>
    <div v-loading="loading" element-loading-text="上传中...">
        <el-upload
            class="upload-col"
            action
            :on-change="getFileAsBase64"
            multiple
            list-type="picture"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/jpg, image/png, image/jpeg"
        >
            <el-button class="button-col" type="primary">上传本地图片</el-button>
        </el-upload>
        <slot class="tip-col">图片格式：JPG、JPEG、PNG</slot>
        <div class="wrap">
            <div class="item" v-for="(item, index) in imglist" :key="index">
                <el-image
                    class="image-col"
                    :src="item.url"
                    :preview-src-list="[item.url]"
                    v-if="imgshow"
                    fit="contain"
                ></el-image>
            </div>
        </div>
    </div>
</template>

<script>
import { imgUrlToBase64, imgFileToBase64 } from '../../utils/ImgToBase64.js'
import axios from 'axios'
export default {
  props: {
    defaultImage: {
      type: String,
      default: ''
    },
    defaultResult: {
      type: Object,
      default: () => {
        return {}
      }
    },
    ocrType: {
      type: String,
      default: ''
    },
    ocrSide: {
      type: String,
      default: 'front'
    },
    ocrSource: {
      type: String,
      default: 'baidu'
    },
    keyToName: Array,
    analyzeResult: {
      type: Function,
      default: (data, keyToName) => {
        let res = []
        for (let index in keyToName) {
          for (let key in keyToName[index]) {
            res.push({
              id: keyToName[index][key],
              keyName: keyToName[index][key],
              value: data[key]
            })
          }
        }
        return res
      }
    }
  },
  data() {
    return {
      base: process.env.BASE_URL,
      imgSrc: '',
      loading: false,
      result: [],
      demo: true,
      JSONResult: [],
      fileName: '',
      imgshow: false,
      imglist: [],
      role: "",
      caseId:""
    }
  },
  methods: {
    async callTypedOCR(imgBase64) {
      this.loading = true
      try {
        let reportno = this.caseId + (new Date().getTime());
        let params = {
          image: imgBase64,
          imgName: this.fileName,
          role: this.role,
          caseId: this.caseId,
          reportno: reportno
        }

        // 检查图像大小，不允许超过 4MB
        // if (imgBase64.length > 10000000) {
        //   ocrResult = {
        //     code: 400,
        //     msg: '图像大小超过限制，请缩小图像后再进行识别'
        //   }
        // }
        // // expense-list-medical，expense-list-beijing，单证大小不能超过3MB
        // else if (
        //   imgBase64.length > 4000000 &&
        //   (this.ocrType == 'BJmedicalinsurance' ||
        //     this.ocrType == 'TencentInsurance')
        // ) {
        //   ocrResult = {
        //     code: 400,
        //     msg: '图像大小超过限制，请缩小图像后再进行识别'
        //   }
        // } else {
        // }
        let res = await window.axios.post('/api/pushocrtest', params)
        this.loading = false
        if (res.code == 200) {
          this.imgshow = true
          // this.$message({
          //   message: res.msg,
          //   type: 'success'
          // })
        } else {
          this.$message({
            message: res.msg,
            type: 'warning'
          })
        }
      } catch (error) {
        this.loading = false
        this.$message({
          message: error,
          type: 'warning'
        })
      }
    },
    async getFileAsBase64(file) {
      // 修改显示的文件名
      this.fileName = file.name
      this.demo = false
      const imgBase64 = await imgFileToBase64(file.raw)
      this.imgSrc = imgBase64
      var rec = {
        url: this.imgSrc
      }
      this.imglist.push(rec)
      this.callTypedOCR(imgBase64)
      return false
    },
    downloadJSON() {
      // 定义保存内容
      let content = new Blob([
        JSON.stringify(
          { 文件名: this.fileName, items: [this.JSONResult] },
          null,
          2
        )
      ])
      // 生成 url 对象
      let urlObject = window.URL || window.webkitURL || window
      let url = urlObject.createObjectURL(content)
      // 生成 <a></a> DOM 元素
      let el = document.createElement('a')
      el.href = url
      // 生成文件名，不能指定路径，只能下载到 downloads 目录
      let jsonFileName = this.fileName.split('.')
      jsonFileName[jsonFileName.length - 1] = 'json'
      el.download = jsonFileName.join('.')
      // 触发点击下载
      el.click()
      // 必须手动释放资源，否则只有关闭浏览器时才释放资源，造成内存泄露
      urlObject.revokeObjectURL(url)
    }
  },
  async mounted() {
    this.demo = true
    // const imgBase64 = await imgUrlToBase64(this.defaultImage)
    // this.callTypedOCR(imgBase64)
    let role = JSON.parse(
      this.uncompileStr(sessionStorage.getItem("UserInfo"))
    ).role.toString();
    this.role = role;
    let caseId = JSON.parse(
      this.uncompileStr(sessionStorage.getItem("UserInfo"))
    ).caseId.toString();
    this.caseId = caseId;
  }
}
</script>

<style scoped>
.image-col {
    border-radius: 5px;
    border: 1px solid lightgray;
    width: 100%;
    height: 100%;
}
.button-col {
    margin-top: 10px;
    width: 100%;
    font-size: 18px;
}
.tip-col {
    margin-top: 5px;
    font-size: 13px;
    color: #575d6c;
}
.result-col {
    overflow: auto;
    color: #000000;
}
.result-col {
    width: 100%;
    height: 450px;
}
.button-download {
    width: 150px;
    margin-top: 20px;
    font-size: 18px;
}
.wrap {
    margin-top: 0px;
    box-sizing: border-box;
    padding: 0 10px;
}
.item {
    width: 300px;
    height: 150px;
    box-sizing: border-box;
    border: 2px solid #fff;
    background: #ddd;
    position: relative;
    overflow: hidden;
    float: left;
}
</style>