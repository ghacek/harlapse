package main

import (
	"errors"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func main() {
	r := setupRouter()
	// Listen and Server in 0.0.0.0:8080
	r.Run("127.0.0.1:8080")
}

func setupRouter() *gin.Engine {
	// Disable Console Color
	// gin.DisableConsoleColor()
	r := gin.Default()
	r.MaxMultipartMemory = 8 << 20 // 8 MiB

	r.LoadHTMLGlob("templates/*")

	r.Static("/public", "./public")

	r.Use(CORSMiddleware())
	r.Use(ErrorHandler)

	//r.Static("/", "./public")

	// Ping test
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	r.GET("/api/har", GetHar)

	// Get user value
	r.POST("/api/new-har", UploadHar)

	return r
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "*")
		//c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

const storageDir = "./public/"

func UploadHar(c *gin.Context) {
	harId := strings.Replace(uuid.New().String(), "-", "", -1)

	filePrefix := storageDir + harId
	form, err := c.MultipartForm()

	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	err = StoreUploadFile(c, form, "har", filePrefix+"-har.json")
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	err = StoreUploadFile(c, form, "ss", filePrefix+"-ss.png")
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(200, gin.H{
		"id": harId,
	})
}

func StoreUploadFile(c *gin.Context, form *multipart.Form, name string, destFile string) error {
	files := form.File[name]

	if len(files) != 1 {
		return errors.New("File " + name + " does not exist in the request")
	}

	file := files[0]

	return c.SaveUploadedFile(file, destFile)
}

func GetHar(c *gin.Context) {
	id := c.Query("id")

	c.HTML(200, "view.html", gin.H{
		"id": id,
	})
}

func ErrorHandler(c *gin.Context) {
	c.Next()

	for _, err := range c.Errors {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

}
