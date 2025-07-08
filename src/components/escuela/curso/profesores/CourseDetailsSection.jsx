import React from "react";
import {
    Box,
    TextField,
    Typography,
    MenuItem,
    CircularProgress,
    InputAdornment,
    Grid,
} from "@mui/material";

const CourseDetailsSection = ({
    formData,
    handleChange,
    bannerFile,
    handleFileChange,
    uploadingBanner,
    cardCoverFile, 
    handleChangeCardCover, 
    uploadingCardCover,
    categorias,
    loadingCategories,
    categoryErrorMessage,
}) => {
    return (
        <>
            <TextField
                label="Título"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Subtítulo"
                name="subtitulo"
                value={formData.subtitulo}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Descripción Corta"
                name="descripcion_corta"
                value={formData.descripcion_corta}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
                required
            />
            <TextField
                label="Descripción Larga"
                name="descripcion_larga"
                value={formData.descripcion_larga}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Subir Imagen del Banner:
            </Typography>
            <TextField
                type="file"
                name="banner_file"
                onChange={handleFileChange}
                fullWidth
                margin="normal"
                inputProps={{ accept: "image/*" }}
                required={!formData.url_banner && !bannerFile}
                helperText="Selecciona un archivo de imagen para el banner (JPG, PNG, GIF, etc.)"
            />
            {bannerFile && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Archivo seleccionado: <strong>{bannerFile.name}</strong>
                </Typography>
            )}
            {uploadingBanner && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                        Subiendo imagen del banner...
                    </Typography>
                </Box>
            )}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Subir Imagen de Portada de Tarjeta:
            </Typography>
            <TextField
                type="file"
                name="portada_tarjeta_file"
                onChange={handleChangeCardCover} 
                fullWidth
                margin="normal"
                inputProps={{ accept: "image/*" }}
                required={!formData.portada_targeta && !cardCoverFile}
                helperText="Selecciona una imagen para la portada de la tarjeta (JPG, PNG, GIF, etc.)"
            />
            {cardCoverFile && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Archivo seleccionado: <strong>{cardCoverFile.name}</strong>
                </Typography>
            )}
            {uploadingCardCover && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                        Subiendo imagen de portada de tarjeta...
                    </Typography>
                </Box>
            )}

            <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
                <Box sx={{ width: "50%" }}>
                    <TextField
                        label="URL Video Introductorio"
                        name="url_video_introductorio"
                        value={formData.url_video_introductorio}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="url"
                        required
                    />
                </Box>

                <Box sx={{ width: "50%" }}>
                    <TextField
                        label="Precio"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="number"
                        inputProps={{ step: "0.01" }}
                        required
                        helperText="Ej: 99.99 (en USD, sin símbolo)"
                    />
                </Box>
            </Box>

            <Box sx={{ width: "100%", display: { xs: "block", md: "flex" }, gap: 2 }}>
                <TextField
                    label="Nivel"
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    select
                    required
                >
                    <MenuItem value="Principiante">Principiante</MenuItem>
                    <MenuItem value="Intermedio">Intermedio</MenuItem>
                    <MenuItem value="Avanzado">Avanzado</MenuItem>
                </TextField>

                <TextField
                    label="Categoría"
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    select
                    required
                    disabled={loadingCategories}
                    helperText={
                        categoryErrorMessage ||
                        (loadingCategories ? "Cargando categorías..." : "")
                    }
                    error={!!categoryErrorMessage}
                >
                    <MenuItem value="">
                        <em>Selecciona una categoría</em>
                    </MenuItem>
                    {loadingCategories ? (
                        <MenuItem disabled>
                            <CircularProgress size={20} /> Cargando...
                        </MenuItem>
                    ) : categoryErrorMessage ? (
                        <MenuItem disabled>Error al cargar</MenuItem>
                    ) : (
                        categorias.map((categoria) => (
                            <MenuItem key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </MenuItem>
                        ))
                    )}
                </TextField>

                <TextField
                    label="Duración"
                    name="duracion_estimada_valor"
                    value={formData.duracion_estimada_valor}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    type="number"
                    required
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <TextField
                                    select
                                    name="duracion_estimada_unidad"
                                    value={formData.duracion_estimada_unidad}
                                    onChange={handleChange}
                                    variant="standard"
                                    sx={{ minWidth: 90, ml: 1 }}
                                >
                                    <MenuItem value="dias">Días</MenuItem>
                                    <MenuItem value="semanas">Semanas</MenuItem>
                                    <MenuItem value="meses">Meses</MenuItem>
                                    <MenuItem value="años">Años</MenuItem>
                                </TextField>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </>
    );
};

export default CourseDetailsSection;